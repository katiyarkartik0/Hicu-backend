import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';

import { InstagramService } from 'src/providers/instagram/instagram.service';
import { PineconeService } from 'src/pinecone/pinecone.service';

import { ProspectsService } from 'src/prospects/prospects.service';
import { CommentLlmGraphState } from '../types';
import { AiService } from '../ai.service';

@Injectable()
export class TuringGraphService {
  private readonly logger = new Logger(TuringGraphService.name);

  constructor(
    private aiService: AiService,
    private instagramService: InstagramService,
    private pineconeService: PineconeService,

    private readonly prospectsService: ProspectsService,
  ) {}

  getGraphChannels(): StateGraphArgs<CommentLlmGraphState>['channels'] {
    return {
      conversationHistory: {
        reducer: (prev: CommentLlmGraphState['conversationHistory']) => {
          return prev;
        },
      },
      commentPayload: {
        reducer: (prev) => prev,
      },
      igAccount: {
        reducer: (prev) => {
          if (!prev || !prev.userId) {
            throw new Error('igAccount must be set and have an id');
          }
          return prev;
        },
      },
      prospect: {
        reducer: (prev) => {
          if (!prev || !prev.userId) {
            throw new Error('prospect must be set and have a userId');
          }
          return prev;
        },
      },
      leadsAsked: {
        reducer: (_, next: CommentLlmGraphState['leadsAsked']) => next,
      },
      accountId: {
        reducer: (prev: number) => prev,
      },
      services: {
        reducer: (prev: CommentLlmGraphState['services']) => prev,
      },
      igCommentAutomation: {
        reducer: (prev: CommentLlmGraphState['igCommentAutomation']) => prev,
      },
    };
  }
  async runGraph({
    conversationHistory,
    commentPayload,
    igAccount,
    prospect,
    accountId,
    services,
    igCommentAutomation,
    leadsAsked,
  }: CommentLlmGraphState) {
    const graphBuilder = new StateGraph<CommentLlmGraphState>({
      channels: this.getGraphChannels(),
    });

    graphBuilder
      .addNode('feedback', (state) => this.respondToFeedbackInComments(state))
      .addNode('leadsNode', (state) => this.generateLeadsInDm(state))
      .addNode('product_enquiry', (state) => this.handleProductEnquiry(state))
      .addConditionalEdges('__start__', (state) =>
        this.aiService.detectIntent(state),
      )
      .addEdge('feedback', 'leadsNode')
      .addEdge('leadsNode', '__end__')
      .addEdge('product_enquiry', '__end__');

    const graph = graphBuilder.compile();

    await graph.invoke({
      conversationHistory,
      commentPayload,
      igAccount,
      prospect,
      accountId,
      services,
      leadsAsked,
      igCommentAutomation,
    });
  }

  async respondToFeedbackInComments(
    state: CommentLlmGraphState,
  ): Promise<CommentLlmGraphState> {
    const accountId = state.accountId;
    const { commentId, commentText: feedbackText } =
      state.commentPayload.comment;

    try {
      const response = await this.aiService.generateFeedbackResponse(
        feedbackText,
        accountId,
      );

      this.logger.log(response, '[feedback responsesss]');

      await this.instagramService.respondToComment(
        commentId,
        response,
        accountId,
      );

      // this.logger.log('respondToFeedbackInComments completed, moving to leadsNode');
      return state;
    } catch (error) {
      this.logger.error(
        `Failed to respond to feedback in comment: ${commentId}`,
        error.stack || error.message,
      );

      return {
        ...state,
        error: `Failed to respond to feedback comment: ${error.message}`,
      };
    }
  }

  async generateLeadsInDm(state: CommentLlmGraphState) {
    try {
      const now = Math.floor(Date.now() / (1000 * 60)); //in minutes

      const {
        leadsAsked: {
          maxGenerationAttemptsPerProspect,
          minGapBetweenPerGenerationAttempt,
          requirements,
        },
        prospect: {
          details,
          lastLeadsGenerationAttempt,
          totalLeadsGenerationAttempts,
          userId,
        },
        commentPayload: {
          comment: { commentText, commentId, commenterUsername },
          media: { mediaOwnerId },
        },
        accountId,
      } = state;

      const canGenerate =
        totalLeadsGenerationAttempts < maxGenerationAttemptsPerProspect &&
        now - lastLeadsGenerationAttempt >= minGapBetweenPerGenerationAttempt;

      if (!canGenerate) {
        this.logger.log(
          `Skipping lead generation. Attempts: ${totalLeadsGenerationAttempts}/${maxGenerationAttemptsPerProspect}, Time gap OK: ${
            now - lastLeadsGenerationAttempt
          } >= ${minGapBetweenPerGenerationAttempt}`,
        );

        return { ...state, response: '' };
      }

      const response = await this.aiService.generateLeadsExtractionText(
        details,
        requirements,
        commentText,
        accountId,
      );

      this.logger.log(`Generated leads response: ${response}`);

      await this.instagramService.sendDM(
        {
          comment: { commentId },
          media: { mediaOwnerId },
        },
        response,
        accountId,
      );

      await this.handleLeadGenAttempt({
        accountId,
        userId,
        username: commenterUsername,
      });
      this.logger.log(`Sent DM for commentId: ${commentId}`);

      return { ...state, response };
    } catch (error) {
      this.logger.error(
        `Failed to generate or send leads in DM: ${error.message}`,
        error.stack,
      );
      return { ...state, response: '' }; // Return safe fallback state
    }
  }

  private async handleLeadGenAttempt({
    accountId,
    userId,
    username,
  }: {
    accountId: number;
    userId: string;
    username?: string;
  }) {
    const now = Math.floor(Date.now() / (1000 * 60)); //in minutes

    const prospect = await this.prospectsService.findByAccountIdUserId({
      userId,
      accountId,
    });
    if (!prospect) {
      return await this.prospectsService.create({
        accountId,
        userId,
        username,
        details: {},
        lastLeadsGenerationAttempt: now,
        totalLeadsGenerationAttempts: 1,
      });
    } else {
      return await this.prospectsService.update({
        accountId,
        userId,
        data: {
          totalLeadsGenerationAttempts: { increment: 1 },
          lastLeadsGenerationAttempt: now,
        },
      });
    }
  }
  async handleProductEnquiry(state: CommentLlmGraphState) {
    const { accountId, services, commentPayload } = state;

    try {
      const result = await this.pineconeService.search({
        accountId,
        query: commentPayload.comment.commentText,
      });

      const response = await this.aiService.makeHumanResponse(
        result,
        accountId,
      );
      await this.instagramService.respondToComment(
        commentPayload.comment.commentId,
        'check DM',
        accountId,
      );
      await this.instagramService.sendDM(
        {
          comment: { commentId: state.commentPayload.comment.commentId },
          media: { mediaOwnerId: state.commentPayload.media.mediaOwnerId },
        },
        response,
        accountId,
      );
    } catch (error) {
      console.error(`Failed to call service:`, error);
    }
  }
}
