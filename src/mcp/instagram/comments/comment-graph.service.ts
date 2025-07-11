import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';

import { InstagramService } from 'src/providers/instagram/instagram.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import { AutomationsService } from 'src/automations/automations.service';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { GeminiPromptService } from './ai.service';

import type { CommentLlmGraphState } from './comments.types';
import { ProspectsService } from 'src/prospects/prospects.service';

@Injectable()
export class CommentGraphService {
  private readonly logger = new Logger(CommentGraphService.name);

  constructor(
    private geminiPromptService: GeminiPromptService,
    private instagramService: InstagramService,
    private pineconeService: PineconeService,
    private readonly automationService: AutomationsService,
    private readonly geminiService: GeminiService,
    private readonly prospectService: ProspectsService
  ) {
    // automationService and geminiService are imported for this binding do not remove
  }

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

    if (igCommentAutomation.commentAutomationId === 1) {
      graphBuilder
        .addNode('feedback', this.respondToFeedbackInComments.bind(this))
        .addNode('leadsNode', this.generateLeadsInDm.bind(this))
        .addNode('product_enquiry', this.handleProductEnquiry.bind(this))
        .addConditionalEdges(
          '__start__',
          this.geminiPromptService.detectIntent.bind(this),
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
  }

  async respondToFeedbackInComments(
    state: CommentLlmGraphState,
  ): Promise<CommentLlmGraphState> {
    const accountId = state.accountId;
    const { commentId, commentText: feedbackText } =
      state.commentPayload.comment;

    try {
      const response = await this.geminiPromptService.generateFeedbackResponse(
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
      const now = Date.now();

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
        },
        commentPayload: {
          comment: { commentText, commentId },
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

      const response =
        await this.geminiPromptService.generateLeadsExtractionText(
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

      // await this.pr

      this.logger.log(`Sent DM for commentId: ${commentId}`);

      return { ...state, response }; // Include response in state for tracking
    } catch (error) {
      this.logger.error(
        `Failed to generate or send leads in DM: ${error.message}`,
        error.stack,
      );
      return { ...state, response: '' }; // Return safe fallback state
    }
  }
  async handleProductEnquiry(state: CommentLlmGraphState) {
    const { accountId, services, commentPayload } = state;

    try {
      const result = await this.pineconeService.search({
        accountId,
        query: commentPayload.comment.commentText,
      });

      const response = await this.geminiPromptService.makeHumanResponse(
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
