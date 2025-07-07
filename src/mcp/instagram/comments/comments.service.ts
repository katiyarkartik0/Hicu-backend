import { Injectable, Logger } from '@nestjs/common';

import { InstagramService } from 'src/providers/instagram/instagram.service';
import { CommentGraphService } from './comment-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { AutomationsService } from 'src/automations/automations.service';
import { LeadsService } from 'src/leads/leads.service';
import { ProspectsService } from 'src/prospects/prospects.service';

import type { CommentLlmGraphState } from './comments.types';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly commentGraphService: CommentGraphService,
    private readonly instagramUtilsService: InstagramUtilsService,
    private readonly automationService: AutomationsService,
    private readonly leadsService: LeadsService,
    private readonly prospectsService: ProspectsService,
  ) {}

  private async getProspect({
    commenterId,
    accountId,
  }): Promise<CommentLlmGraphState['prospect']> {
    try {
      const prospect = await this.prospectsService.findByAccountIdUserId({
        accountId,
        userId: commenterId,
      });

      if (prospect) return prospect;

      this.logger.debug(
        `Prospect not found. Returning default for ${commenterId}`,
      );
      return {
        userId: commenterId,
        details: [],
        lastLeadsGenerationAttempt: 0,
        totalLeadsGenerationAttempts: 0,
      };
    } catch (err) {
      this.logger.error(`Failed to fetch prospect: ${err.message}`, err.stack);
      throw err;
    }
  }

  private getSanitizedHistory({
    conversationHistory,
    commenterId,
    mediaOwnerId,
  }): CommentLlmGraphState['conversationHistory'] {
    try {
      if (!conversationHistory) {
        this.logger.debug('No conversation history found.');
        return { prospect: [], account: [] };
      }

      return this.instagramUtilsService.sanitizeHistory(
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

  async handleComment(webhookPayload: any, accountId: number) {
    try {
      const payload =
        this.instagramUtilsService.sanitizeCommentPayload(webhookPayload);

      const {
        comment: { commenterId },
        media: { mediaOwnerId, mediaId },
      } = payload;

      this.logger.log(
        `Handling comment from ${commenterId} on media ${mediaId}`,
      );

      const igCommentAutomation =
        await this.automationService.findByIgCommentAutomationByMedia(mediaId);

      if (!igCommentAutomation?.commentAutomationId) {
        return;
      }

      const prospect = await this.getProspect({ commenterId, accountId });

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

      const shopifyServices = []; // Optional, can move to constants
      const leadsAsked = await this.getAskedLeads(accountId);

      const graphState: CommentLlmGraphState = {
        conversationHistory: sanitizedHistory,
        igAccount: { userId: mediaOwnerId },
        prospect,
        accountId,
        commentPayload: payload,
        services: shopifyServices,
        igCommentAutomation,
        leadsAsked,
      };

      this.logger.log(`Running graph for commenter ${commenterId}`);
      await this.commentGraphService.runGraph(graphState);
    } catch (err) {
      this.logger.error('Error handling comment webhook', err.stack);
      throw err;
    }
  }
}
