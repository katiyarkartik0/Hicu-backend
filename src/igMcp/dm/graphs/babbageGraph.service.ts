import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { Injectable, Logger } from '@nestjs/common';

import { InstagramService } from 'src/providers/instagram/instagram.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import { ProspectsService } from 'src/prospects/prospects.service';
import { AiService } from '../ai.service';
import { DmLlmGraphState } from '../types';

@Injectable()
export class BabbageGraphService {
  private readonly logger = new Logger(BabbageGraphService.name);

  constructor(
    private aiService: AiService,
    private instagramService: InstagramService,
    private pineconeService: PineconeService,
    private readonly prospectsService: ProspectsService,
  ) {}
  getGraphChannels(): StateGraphArgs<DmLlmGraphState>['channels'] {
    return {
      conversationHistory: {
        reducer: (prev: DmLlmGraphState['conversationHistory']) => {
          return prev;
        },
      },
      dmPayload: {
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
        reducer: (_, next: DmLlmGraphState['leadsAsked']) => next,
      },
      accountId: {
        reducer: (prev: number) => prev,
      },
      services: {
        reducer: (prev: DmLlmGraphState['services']) => prev,
      },
      igDmAutomation: {
        reducer: (prev: DmLlmGraphState['igDmAutomation']) => prev,
      },
    };
  }

  async runGraph({
    conversationHistory,
    dmPayload,
    igAccount,
    prospect,
    accountId,
    services,
    igDmAutomation,
    leadsAsked,
  }: DmLlmGraphState) {
    const graphBuilder = new StateGraph<DmLlmGraphState>({
      channels: this.getGraphChannels(),
    });

    if (true) {
      graphBuilder
        .addNode('feedback', (state) => this.respondToFeedbackInDm(state))
        .addNode('personal_details', (state) =>
          this.handlePersonalDetails(state),
        )
        .addNode('product_enquiry', (state) => this.handleProductEnquiry(state))
        .addConditionalEdges('__start__', (state) =>
          this.aiService.detectIntent(state),
        )
        .addEdge('feedback', '__end__')
        .addEdge('personal_details', '__end__')
        .addEdge('product_enquiry', '__end__');
      const graph = graphBuilder.compile();
      await graph.invoke({
        conversationHistory,
        dmPayload,
        igAccount,
        prospect,
        accountId,
        services,
        leadsAsked,
        igDmAutomation,
      });
    }
  }

  async handleProductEnquiry(state: DmLlmGraphState) {
    const { accountId, dmPayload } = state;

    try {
      const result = await this.pineconeService.search({
        accountId,
        query: dmPayload.dm.messageText,
      });

      const response = await this.aiService.makeHumanResponse(
        result,
        accountId,
      );
      await this.instagramService.sendDmForExistingConversation({
        recipientId: dmPayload.dm.senderId,
        message: response,
        accountId,
      });
    } catch (error) {
      console.error(`Failed to call service:`, error);
    }
  }

  async respondToFeedbackInDm(
    state: DmLlmGraphState,
  ): Promise<DmLlmGraphState> {
    const accountId = state.accountId;

    const feedbackText = state.dmPayload.dm.messageText;

    try {
      const response = await this.aiService.generateFeedbackResponse(
        feedbackText,
        accountId,
      );

      this.logger.log(response, '[feedback responsesss]');

      await this.instagramService.sendDmForExistingConversation({
        recipientId: state.dmPayload.dm.senderId,
        message: response,
        accountId,
      });
      // this.logger.log('respondToFeedbackInComments completed, moving to leadsNode');
      return state;
    } catch (error) {
      this.logger.error(
        `Failed to respond to feedback in dm`,
        error.stack || error.message,
      );

      return {
        ...state,
        error: `Failed to respond to feedback comment: ${error.message}`,
      };
    }
  }

  async handlePersonalDetails(state: DmLlmGraphState) {
    const messageText = state.dmPayload.dm.messageText;
    const detailsRequired = state.leadsAsked.requirements;
    const detailsCollected = state.prospect.details;
    const updatedDetails = await this.aiService.bringDetails({
      messageText,
      detailsCollected,
      detailsRequired,
      accountId: state.accountId,
    });
    await this.prospectsService.upsertPersonalDetails({
      accountId: state.accountId,
      userId: state.prospect.userId,
      details: updatedDetails,
    });
  }
}
