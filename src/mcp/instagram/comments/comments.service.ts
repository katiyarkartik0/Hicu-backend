import { Injectable, Logger } from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { CommentGraphService } from './comment-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { AutomationsService } from 'src/automations/automations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import type { LeadsAsked } from 'src/automations/automations.types';
import { LeadsService } from 'src/leads/leads.service';
import type {
  CommentLlmGraphState,
  ConversationHistory,
  Prospect,
} from './comments.types';

@Injectable()
export class CommentsService {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly commentGraphService: CommentGraphService,
    private readonly instagramUtilsService: InstagramUtilsService,
    private readonly automationService: AutomationsService,
    private readonly prismaService: PrismaService,
    private readonly leadsService: LeadsService,
  ) {}

  private async getProspect({ commenterId, accountId }): Promise<Prospect> {
    const prospect: Prospect = (await this.prismaService.prospect.findFirst({
      where: {
        userId: commenterId,
        accountId,
      },
    })) || {
      userId: commenterId,
      details: [],
      lastLeadsGenerationAttempt: 0,
      totalLeadsGenerationAttempts: 0,
    };

    return prospect;
  }

  private getSanitizedHistory({
    conversationHistory,
    commenterId,
    mediaOwnerId,
  }): ConversationHistory {
    const sanitizedHistory = conversationHistory
      ? this.instagramUtilsService.sanitizeHistory(
          conversationHistory.messages.data,
          commenterId,
          mediaOwnerId,
        )
      : { prospect: [], account: [] };

    return sanitizedHistory;
  }

  private async getAskedLeads(accountId: number): Promise<LeadsAsked> {
    const leadsAsked: LeadsAsked = (await this.leadsService.findByAccount(
      accountId,
    )) || {
      requirements: [],
      maxGenerationAttemptsPerProspect: 0,
      minGapBetweenPerGenerationAttempt: 0,
    };

    return leadsAsked;
  }

  async handleComment(webhookPayload: any, accountId: number) {
    const payload =
      this.instagramUtilsService.sanitizeCommentPayload(webhookPayload);

    const {
      comment: { commenterId },
      media: { mediaOwnerId, mediaId },
    } = payload;

    const igCommentAutomation =
      await this.automationService.findByIgCommentAutomationByMedia(mediaId);
    if (!igCommentAutomation || !igCommentAutomation.commentAutomationId) {
      return;
    }

    const prospect: Prospect = await this.getProspect({
      commenterId,
      accountId,
    });

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
      history: sanitizedHistory,
      accountIg: { userId: mediaOwnerId },
      prospect,
      accountId,
      commentPayload: payload,
      services: shopifyServices,
      igCommentAutomation,
      leadsAsked,
    };

    await this.commentGraphService.runGraph(graphState);
  }
}
