import { Injectable, Logger } from '@nestjs/common';

import { InstagramService } from 'src/providers/instagram/instagram.service';
import { AutomationsService } from 'src/automations/automations.service';
import { LeadsService } from 'src/leads/leads.service';
import { ProspectsService } from 'src/prospects/prospects.service';

import type { SanitizedCommentPayload } from 'src/providers/instagram/instagram.types';
import { UtilsService } from '../utils.service';
import {
  CommentLlmGraphState,
} from './types';

import { GraphService } from './graph.service';


@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly utilsService: UtilsService,
    private readonly automationService: AutomationsService,
    private readonly leadsService: LeadsService,
    private readonly prospectsService: ProspectsService,
    private readonly graphService: GraphService,
  ) {}

  private getSanitizedHistory({
    conversationHistory,
    commenterId,
    mediaOwnerId,
  }: {
    conversationHistory: any;
    commenterId: string;
    mediaOwnerId: string;
  }): CommentLlmGraphState['conversationHistory'] {
    try {
      if (!conversationHistory) {
        this.logger.debug('No conversation history found.');
        return { prospect: [], account: [] };
      }

      return this.utilsService.sanitizeHistory(
        conversationHistory.messages.data,
        commenterId,
        mediaOwnerId,
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

  private async createProspectIfNotAlready({
    accountId,
    userId,
    username,
  }: {
    accountId: number;
    userId: string;
    username?: string;
  }): Promise<CommentLlmGraphState['prospect']> {
    const prospect = await this.prospectsService.findByAccountIdUserId({
      accountId,
      userId,
    });
    if (!prospect) {
      return await this.prospectsService.create({
        accountId,
        userId,
        username,
        details: {},
        lastLeadsGenerationAttempt: 0,
        totalLeadsGenerationAttempts: 0,
      });
    }
    return prospect;
  }

  async handleComment(webhookPayload: any, accountId: number) {

    try {
      const payload: SanitizedCommentPayload =
        this.utilsService.sanitizeCommentPayload(webhookPayload);

      const {
        comment: { commenterId, commenterUsername },
        media: { mediaOwnerId, mediaId },
      } = payload;
      const prospect = await this.createProspectIfNotAlready({
        accountId,
        userId: commenterId,
        username: commenterUsername,
      });

      const igCommentAutomation =
        await this.automationService.findByIgCommentAutomationByMedia(mediaId);

      if (
        !igCommentAutomation ||
        igCommentAutomation.commentAutomationId === null
      ) {
        return;
      }

      const leadsAsked = await this.getAskedLeads(accountId);

      const sanitizedHistory = await this.sanitizedConversationHistory({
        commenterId,
        accountId,
        mediaOwnerId,
      });

      const graphState: CommentLlmGraphState = {
        conversationHistory: sanitizedHistory,
        igAccount: { userId: mediaOwnerId },
        prospect,
        accountId,
        commentPayload: payload,
        services: [],
        igCommentAutomation,
        leadsAsked,
      };
      this.logger.log(`Running graph for commenter ${commenterId}`);
      await this.graphService.handleAutomation(graphState);
    } catch (err) {
      this.logger.error('Error handling comment webhook', err.stack);
      throw err;
    }
  }

  private async sanitizedConversationHistory({
    commenterId,
    accountId,
    mediaOwnerId,
  }: {
    commenterId: string;
    accountId: number;
    mediaOwnerId: string;
  }) {
    const conversationHistory =
      await this.instagramService.getConversationHistory(
        commenterId,
        accountId,
      );

    const sanitizedHistory = this.getSanitizedHistory({
      commenterId,
      mediaOwnerId,
      conversationHistory,
    });

    return sanitizedHistory;
  }
}
