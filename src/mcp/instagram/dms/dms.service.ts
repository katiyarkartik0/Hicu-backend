import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { AutomationsService } from 'src/automations/automations.service';
import { ProspectsService } from 'src/prospects/prospects.service';
import { CommentLlmGraphState } from '../comments/comments.types';
import { LeadsService } from 'src/leads/leads.service';
import { DmGraphService } from './dm-graph.service';
import { DmLlmGraphState } from './dms.types';

@Injectable()
export class DmsService {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly instagramUtilsService: InstagramUtilsService,
    private readonly automationService: AutomationsService,
    private readonly prospectsService: ProspectsService,
    private readonly leadsService: LeadsService,
    private readonly dmGraphService: DmGraphService,
  ) {}
  private readonly logger = new Logger(DmsService.name);

  private async getProspect({ senderId, accountId }): Promise<any> {
    try {
      const prospect = await this.prospectsService.findByAccountIdUserId({
        accountId,
        userId: senderId,
      });

      if (prospect) return prospect;

      this.logger.debug(
        `Prospect not found. Returning default for ${senderId}`,
      );
      return {
        userId: senderId,
        details: [],
        lastLeadsGenerationAttempt: 0,
        totalLeadsGenerationAttempts: 0,
      };
    } catch (err) {
      this.logger.error(`Failed to fetch prospect: ${err.message}`, err.stack);
      throw err;
    }
  }
  async handleDm(webhookPayload: any, accountId: number) {
    const payload =
    this.instagramUtilsService.sanitizeDmPayload(webhookPayload);
    const igDmAutomation =
      await this.automationService.findByIgDmAutomationByAccount(accountId);
    // if (!igDmAutomation?.dmAutomationId) {
    //   return;
    // }

    const {
      dm: { senderId, recipientId },
    } = payload;

    const prospect = await this.getProspect({ senderId, accountId });

    const conversationHistory =
      await this.instagramService.getConversationHistory(senderId, accountId);

    const sanitizedHistory = this.getSanitizedHistory({
      senderId,
      recipientId,
      conversationHistory,
    });

    const leadsAsked = await this.getAskedLeads(accountId);

    const graphState: DmLlmGraphState = {
      conversationHistory: sanitizedHistory,
      igAccount: { userId: senderId },
      prospect,
      accountId,
      dmPayload: payload,
      services: [],
      igDmAutomation,
      leadsAsked,
    };

    this.logger.log(`Running graph for commenter ${senderId}`);
    await this.dmGraphService.runGraph(graphState);
  }

  private getSanitizedHistory({
    conversationHistory,
    senderId,
    recipientId,
  }): CommentLlmGraphState['conversationHistory'] {
    try {
      if (!conversationHistory) {
        this.logger.debug('No conversation history found.');
        return { prospect: [], account: [] };
      }

      return this.instagramUtilsService.sanitizeHistory(
        conversationHistory.messages.data,
        senderId,
        recipientId,
      );
    } catch (err) {
      this.logger.error('Failed to sanitize conversation history', err.stack);
      return { prospect: [], account: [] }; // Fallback
    }
  }

  private async getAskedLeads(
    accountId: number,
  ): Promise<CommentLlmGraphState['leadsAsked']> {
    try {
      const leadsAsked = await this.leadsService.findByAccount(accountId);

      if (leadsAsked) return leadsAsked;

      this.logger.debug(`No leadsAsked found for account ${accountId}`);
      return {
        requirements: [],
        maxGenerationAttemptsPerProspect: 0,
        minGapBetweenPerGenerationAttempt: 0,
      };
    } catch (err) {
      this.logger.error(
        `Failed to fetch leadsAsked: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }
}
