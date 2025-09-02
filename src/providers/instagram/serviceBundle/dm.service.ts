import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrivateInfoService } from './privateInfo.service';
import { IgDmDto, InstagramConversation } from '../instagram.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DmService {
  private readonly logger = new Logger(DmService.name);

  constructor(
    private readonly privateInfoService: PrivateInfoService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   slide into DMs of the commenter
   * */
  async sendDM(
    { comment: { commentId }, media: { mediaOwnerId } }: any,
    message: string,
    accountId: number,
  ) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        {
          accountId,
        },
      );

      const { igUserId } = await this.privateInfoService.getMyDetails({
        accountId,
      });

      const url = `https://graph.instagram.com/v21.0/${igUserId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient: { comment_id: commentId },
          message: { text: message },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Failed to send DM: ${errorBody}`);
        throw new InternalServerErrorException(`Failed to send DM`);
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `[sendDM] Error sending DM for comment ${commentId} on account ${accountId}`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async sendDmForExistingConversation({
    recipientId,
    message,
    accountId,
  }: {
    recipientId: string;
    message: string;
    accountId: number;
  }) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        { accountId },
      );
      const { igUserId } = await this.privateInfoService.getMyDetails({
        accountId,
      });

      const url = `https://graph.instagram.com/${igUserId}/messages`;

      this.logger.debug(
        `[sendDmForExistingConversation] Sending DM to ${recipientId}: ${message}`,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          messaging_type: 'RESPONSE',
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `[sendDmForExistingConversation] Failed to send DM: ${errorBody}`,
        );
        throw new InternalServerErrorException(
          `Failed to send message to existing conversation`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `[sendDmForExistingConversation] Error sending DM to ${recipientId} for account ${accountId}`,
        error.stack || error.message,
      );

      throw new InternalServerErrorException(error.message);
    }
  }

  async sendImageInDm({ recipientId, imageUrl, accountId }) {
    const accessToken = await this.privateInfoService.getInstagramAccessToken({
      accountId,
    });
    const { igUserId } = await this.privateInfoService.getMyDetails({
      accountId,
    });
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
          },
        },
      },
    };
    try {
      const response = await fetch(
        `https://graph.instagram.com/v21.0/${igUserId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody);
      }

      return response.json();
    } catch (err) {
      this.logger.error(`Failed to send DM in conversation: ${err.message}`);
      throw new InternalServerErrorException(
        `Failed to send message to existing conversation`,
        err.message,
      );
    }
  }

  async getConversationHistory(
    userId: string,
    accountId: number,
  ): Promise<InstagramConversation | undefined> {
    const accessToken = await this.privateInfoService.getInstagramAccessToken({
      accountId,
    });
    try {
      const params = new URLSearchParams({
        user_id: userId,
        access_token: accessToken,
        fields: 'messages{id,created_time,from,message}',
        limit: '8',
      });
      const response = await fetch(
        `https://graph.instagram.com/v22.0/me/conversations?${params.toString()}`,
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Instagram API error: ${response.status} ${error}`);
      }

      const { data } = await response.json();
      return data[0] as InstagramConversation;
    } catch (error) {
      this.logger.error(
        'Error fetching Instagram conversation history',
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch Instagram conversation history',
        error.message,
      );
    }
  }
  async saveDm(dm: Omit<IgDmDto, 'createdAt'>) {
    try {
      return await this.prismaService.igDm.create({ data: dm });
    } catch (err) {
      this.logger.error(
        'Failed to save DM to database',
        err.stack || err.message,
      );
      throw new InternalServerErrorException('Failed to save DM');
    }
  }

  /**
   * Fetches the full DM conversation between a given Instagram account
   * (`accountId` in our system) and a specific user (`userIdFromWebhookPayload`).
   *
   * ⚠️ IMPORTANT:
   * - The `userIdFromWebhookPayload` must come directly from Instagram webhook events
   *   (`sender.id` or `recipient.id` in the payload).
   * - Do NOT use the user ID returned from `https://graph.instagram.com/me`
   *   (Basic Display API), because that is a different ID namespace and will never
   *   match the DM webhook IDs.
   * - Only Instagram Business/Creator accounts connected to a Facebook Page
   *   receive webhook events with the correct `1784...`-style IG User IDs.
   *
   * Example usage:
   *   getConversation(123, "17841400008460056")
   */
  async getSavedConversation(accountId: number, userIdFromWebhookPayload: string) {
    return await this.prismaService.igDm.findMany({
      where: {
        accountId,
        OR: [
          { senderId: userIdFromWebhookPayload },
          { recipientId: userIdFromWebhookPayload },
        ],
      },
      orderBy: {
        timestamp: 'asc', // chronological order
      },
    });
  }
}
