import { Injectable } from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { CommentGraphService } from '../comments/comment-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { AutomationsService } from 'src/automations/automations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeadsAsked } from 'src/automations/automations.types';

@Injectable()
export class DmsService {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly commentGraphService: CommentGraphService,
    private readonly instagramUtilsService: InstagramUtilsService,
    private readonly automationService: AutomationsService,
    private readonly prismaService: PrismaService,
  ) {}
//   async handleDm(webhookPayload: any, accountId: number) {
//     const payload =
//       this.instagramUtilsService.sanitizeDmPayload(webhookPayload);

//     const automations = await this.automationService.findAll({ accountId });
//     const 
//     if (!automation || !automation[0].commentAutomationId) {
//       return;
//     }

//     const { senderId, recipientId } = payload.dm;
//     const prospect = await this.prismaService.prospect.findFirst({
//       where: {
//         userId: senderId,
//         accountId,
//       },
//     });

//     const conversationHistory =
//       await this.instagramService.getConversationHistory(senderId, accountId);

//     const sanitizedHistory = conversationHistory
//       ? this.instagramUtilsService.sanitizeHistory(
//           conversationHistory.messages.data,
//           senderId,
//           recipientId,
//         )
//       : { prospect: [], account: [] };

//     const shopifyServices = []; // Optional, can move to constants

//     const leadsAsked = automation[].leads as LeadsAsked;

//     const leadsCollected: LeadsCollected = prospect
//       ? (prospect.details as LeadsCollected)
//       : { details: {}, totalAttempts: 0, lastAttempt: 0 };
//   }
}
