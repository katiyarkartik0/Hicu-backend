import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from 'src/shared/http/http.service';
import { InstagramConfig } from './instagram.types';
import { WEBHOOK_PROVIDERS } from 'src/webhook/types/webhook.types';
import { CreateCommentDto } from './dto/webhook.dto';
import { ReplyModel } from './instagram.schema';

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

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

    if (
      !commentId ||
      !commenterUsername ||
      !postOwnerId ||
      !commenterId ||
      !commentText
    ) {
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

/**
 * Handles an Instagram comment event:
 * - Replies to the comment if the commenter is not the post owner
 * - Fetches post information related to the reply
 * - Saves reply information in the database
 * - Sends a DM (Direct Message) to the commenter
 * 
 * @param payload Webhook payload containing comment and post details
 */
async handleBotCommentEvent(payload: any) {
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

      const postInfo = await this.getPostInfoByReplyId(respondedCommentId);

      await this.saveReplyInfo(postInfo);

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

  async getAllPosts({ limit = 10 }) {
    try {
      const { INSTAGRAM } = WEBHOOK_PROVIDERS;
      const { accessToken } =
        this.configService.getOrThrow<InstagramConfig>(INSTAGRAM);
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp&limit=${limit}&access_token=${accessToken}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new InternalServerErrorException(
          `Instagram API Error: ${response.status} - ${errorBody}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram posts', error.stack);
      throw new InternalServerErrorException('Failed to fetch Instagram posts');
    }
  }
  async getCommentsByPostId(postId: string) {
    try {
      const { INSTAGRAM } = WEBHOOK_PROVIDERS;
      const { accessToken } =
        this.configService.getOrThrow<InstagramConfig>(INSTAGRAM);
      const response = await fetch(
        `https://graph.instagram.com/${postId}/comments?fields=id,parent_id,text,from{id,username},created_time&access_token=${accessToken}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new InternalServerErrorException(
          `Instagram API Error: ${response.status} - ${errorBody}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram comments', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram comments',
      );
    }
  }

  async getPostInfoByReplyId(commentId: string) {
    try {
      const { INSTAGRAM } = WEBHOOK_PROVIDERS;
      const { accessToken } =
        this.configService.getOrThrow<InstagramConfig>(INSTAGRAM);
      const response = await fetch(
        `https://graph.instagram.com/${commentId}?fields=id,parent_id,media,text,from{id,username}&access_token=${accessToken}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new InternalServerErrorException(
          `Instagram API Error: ${response.status} - ${errorBody}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram comments', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram comments',
      );
    }
  }

  async saveReplyInfo(replyInfo: CreateCommentDto) {
    try {
      return await ReplyModel.create(replyInfo);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Failed to save reply info');
    }
  }
}
