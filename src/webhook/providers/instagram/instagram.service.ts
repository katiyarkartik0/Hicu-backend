import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/shared/http/http.service';
import { InstagramConfig } from './instagram.types';
import { WEBHOOK_PROVIDERS } from 'src/webhook/types/webhook.types';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);
  private readonly handledComments = new Set<string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private extractCommentDetails(payload: any): any {
    const commentId = payload.entry[0].changes[0].value.id;
    const commenterUsername = payload.entry[0].changes[0].value.from.username;
    const postOwnerId = payload.entry[0].id;
    const commenterId = payload.entry[0].changes[0].value.from.id;
    const commentText = payload.entry[0].changes[0].value.text;

    if (!commentId || !commenterUsername || !postOwnerId || !commenterId || !commentText) {
      this.logger.error('Missing required fields in comment event payload');
      throw new Error('Invalid comment event payload');
    }

    return {
      comment: {
        commentId,
        commenterUsername,
        commenterId,
        commentText,
      },
      post: { postOwnerId },
    };
  }

  async respondToComment(commentId: string, message: string) {
    const { INSTAGRAM } = WEBHOOK_PROVIDERS;
    const { accessToken, apiVersion } =
      this.configService.getOrThrow<InstagramConfig>(INSTAGRAM);

    const url = `https://graph.instagram.com/${apiVersion}/${commentId}/replies`;

    return this.httpService.post(url, {
      message,
      access_token: accessToken,
    });
  }

  async sendDM(postOwnerId: string, commentId: string, message: string) {
    const { INSTAGRAM } = WEBHOOK_PROVIDERS;
    const { accessToken } =
      this.configService.getOrThrow<InstagramConfig>(INSTAGRAM);
    const url = `https://graph.instagram.com/${postOwnerId}/messages`;

    return this.httpService.post(
      url,
      {
        recipient: { comment_id: commentId },
        message: { text: message },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  }

  async handleCommentEvent(payload: any) {
    try {
      const {
        comment: { commentId, commenterId, commenterUsername },
        post: { postOwnerId },
      } = this.extractCommentDetails(payload);

      if (commenterId !== postOwnerId) {
        const response = await this.respondToComment(
          commentId,
          `@${commenterUsername} Check DM`,
        );

        const { id: respondedCommentId } = await response.data;
        this.handledComments.add(respondedCommentId);

        await this.sendDM(
          postOwnerId,
          commentId,
          `hey ${commenterUsername} here is your 5%OFF coupon code SLVAAM`,
        );
      }
    } catch (error) {
      this.logger.error('Error handling comment event', error.stack);
      throw error;
    }
  }
}
