import { Injectable, Logger } from '@nestjs/common';
import { GeminiPromptService } from './gemini-prompt.service';
import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import {
  CommentLlmGraphState,
  ConversationHistory,
  Leads,
  ServiceContext,
} from './comments.types';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import { AutomationsService } from 'src/automations/automations.service';
import {
  Automation,
  IgCommentAutomation,
  LeadsAsked,
} from 'src/automations/automations.types';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';

@Injectable()
export class CommentGraphService {
  private readonly logger = new Logger(CommentGraphService.name);

  constructor(
    private geminiPromptService: GeminiPromptService,
    private instagramService: InstagramService,
    private pineconeService: PineconeService,
    private readonly automationService: AutomationsService,
    private readonly geminiService: GeminiService,
  ) {}

  getGraphChannels(): StateGraphArgs<CommentLlmGraphState>['channels'] {
    return {
      history: {
        reducer: (prev: ConversationHistory) => {
          return prev;
        },
      },
      commentPayload: {
        reducer: (prev) => prev,
      },
      accountIg: {
        reducer: (prev) => {
          if (!prev || !prev.userId) {
            throw new Error('accountIg must be set and have an id');
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
        reducer: (_, next: LeadsAsked) => next,
      },
      accountId: {
        reducer: (prev: number) => prev,
      },
      services: {
        reducer: (prev: ServiceContext[]) => prev,
      },
      igCommentAutomation: {
        reducer: (prev: IgCommentAutomation) => prev,
      },
    };
  }
  async runGraph({
    history,
    commentPayload,
    accountIg,
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
        history,
        commentPayload,
        accountIg,
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

      console.log(response, '[feedback response]');

      await this.instagramService.respondToComment(
        commentId,
        response,
        accountId,
      );

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
      return { ...state, response: '' };
    }

    const response = await this.geminiPromptService.generateLeadsExtractionText(
      details,
      requirements,
      commentText,
      accountId,
    );

    console.log(response, '[generate leads in dm]');

    await this.instagramService.sendDM(
      {
        comment: { commentId },
        media: { mediaOwnerId },
      },
      response,
      accountId,
    );
  }
  async handleProductEnquiry(state: CommentLlmGraphState) {
    const { accountId, history, services, commentPayload } = state;

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
