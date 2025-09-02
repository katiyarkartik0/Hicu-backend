import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { AutomationsService } from 'src/automations/automations.service';
import { ProspectsService } from 'src/prospects/prospects.service';
import { LeadsService } from 'src/leads/leads.service';
import { UtilsService } from '../utils.service';
import { BabbageGraphService } from './graphs/babbageGraph.service';
import { DmLlmGraphState } from './types';

@Injectable()
export class DmService {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly utilsService: UtilsService,
    private readonly automationService: AutomationsService,
    private readonly prospectsService: ProspectsService,
    private readonly leadsService: LeadsService,
    private readonly babbageGraphService: BabbageGraphService,
  ) {}
  private readonly logger = new Logger(DmService.name);

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
    const payload = this.utilsService.sanitizeDmPayload(webhookPayload);
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
    await this.handleAutomation(graphState);
  }

  private getSanitizedHistory({
    conversationHistory,
    senderId,
    recipientId,
  }): DmLlmGraphState['conversationHistory'] {
    try {
      if (!conversationHistory) {
        this.logger.debug('No conversation history found.');
        return { prospect: [], account: [] };
      }

      return this.utilsService.sanitizeHistory(
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
  ): Promise<DmLlmGraphState['leadsAsked']> {
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

  async handleAutomation(graphState: DmLlmGraphState) {
    const { igDmAutomation } = graphState;
    // if (igDmAutomation?.dmAutomationId === 1) {
    await this.babbageGraphService.runGraph(graphState);
    // }
  }
}
