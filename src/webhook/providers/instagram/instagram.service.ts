import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstagramConfig } from './instagram.types';
import { WEBHOOK_PROVIDERS } from 'src/webhook/types/webhook.types';
import { CreateCommentDto } from './dto/webhook.dto';
import { ReplyModel } from './instagram.schema';
import { registeredActions } from 'src/shared/prompts/prompts';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { AutomationsService } from 'src/automations/automations.service';
import { INSTAGRAM_EVENTS } from './constants/instagram.events';
import { PrismaService } from 'src/prisma/prisma.service';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';
import { ConfigurationsService } from 'src/configurations/configurations.service';

type CommentInput = {
  action: any;
  conversationHistory: any;
  trigger: string;
  commentText: string;
  dmText?: never; // explicitly disallow dmText
};

type DMInput = {
  action: any;
  conversationHistory: any;
  trigger: string;
  commentText?: never; // explicitly disallow commentText
  dmText: string;
};

type GetPromptInput = CommentInput | DMInput;

type MediaItem = {
  id: string;
  mediaType: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
  thumbnail: string;
};

type UserProfile = {
  id: string;
  name: string;
  username: string;
  biography: string;
  profilePictureUrl: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  accountType: string;
  media: {
    data: MediaItem[];
  };
};

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly automationService: AutomationsService,
    private readonly prismaService: PrismaService,
    private readonly configurationsService: ConfigurationsService,
  ) {}

  async getInstagramEventType(body: any, accountId: number): Promise<string> {
    const { INVALID, DM_RECEIVED, DM_ECHO, COMMENTS, COMMENT_ECHO, UNKNOWN } =
      INSTAGRAM_EVENTS;

    if (!body || !body.entry || !Array.isArray(body.entry)) {
      return INVALID;
    }

    const entry = body.entry[0];

    if (entry.changes?.[0]?.field === COMMENTS) {
      const comment = entry.changes?.[0]?.value;
      const commenterId = comment?.from?.id;
      const commenterUsername = comment?.from?.username;
      const { id, username } = await this.getMyDetails({ accountId });
      if (commenterId === id || commenterUsername === username) {
        return COMMENT_ECHO;
      } else {
        return COMMENTS;
      }
    }

    if (entry.messaging?.[0]) {
      const messagingEvent = entry.messaging[0];
      return messagingEvent.message?.is_echo ? DM_ECHO : DM_RECEIVED;
    }

    return UNKNOWN;
  }
  private getInstagramFields(): string {
    return [
      'id',
      'name',
      'username',
      'biography',
      'profile_picture_url',
      'followers_count',
      'follows_count',
      'media_count',
      'account_type',
      'media{id,caption,media_type,media_url,thumbnail_url,timestamp}',
    ].join(',');
  }

  private async getInstagramAccessToken({ accountId }: { accountId: number }) {
    const { config: configurations } =
      await this.configurationsService.getConfigurationForAccount({
        integrationName: 'instagram',
        accountId,
      });
    const accessToken =
      configurations[CONFIGURATIONS_VARIABLES.INSTAGRAM.ACCESS_TOKEN];
    return accessToken;
  }

  async getMyDetails({
    accountId,
  }: {
    accountId: number;
  }): Promise<UserProfile> {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });
      const params = new URLSearchParams({
        fields: this.getInstagramFields(),
        access_token: accessToken,
      });

      const url = `https://graph.instagram.com/me?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Instagram API error: ${response.status} - ${errorText}`,
        );
        throw new Error('Instagram API request failed');
      }

      const {
        id,
        name,
        username,
        biography,
        profile_picture_url,
        followers_count,
        follows_count,
        media_count,
        account_type,
        media: { data },
      } = await response.json();

      const mediaItems: MediaItem[] = data.map(
        ({ id, media_type, media_url, caption, thumbnail, timestamp }) =>
          ({
            id,
            mediaType: media_type,
            mediaUrl: media_url,
            caption,
            timestamp,
            thumbnail,
          }) as MediaItem,
      );

      return {
        id,
        name,
        username,
        biography: biography || '',
        profilePictureUrl: profile_picture_url || '',
        followersCount: followers_count,
        followsCount: follows_count,
        mediaCount: media_count,
        accountType: account_type,
        media: {
          data: mediaItems,
        },
      };
    } catch (error) {
      this.logger.error(
        'Error fetching my details',
        error.stack || error.message,
      );
      throw new InternalServerErrorException('Failed to fetch my details');
    }
  }

  /**
 * {
  "entry": [
    {
      "id": "17841473601649478",
      "time": 1746719317,
      "changes": [
        {
          "value": {
            "from": {
              "id": "596737893526310",
              "username": "katiyarkartik0"
            },
            "media": {
              "id": "18272619871264678",
              "media_product_type": "FEED"
            },
            "id": "18041692787227494",
            "text": "qwe"
          },
          "field": "comments"
        }
      ]
    }
  ],
  "object": "instagram"
}
 */
  private extractCommentDetails(payload: any): any {
    const commentId = payload.entry[0].changes[0].value.id;
    const commenterUsername = payload.entry[0].changes[0].value.from.username;
    const mediaOwnerId = payload.entry[0].id;
    const commenterId = payload.entry[0].changes[0].value.from.id;
    const commentText = payload.entry[0].changes[0].value.text;
    const mediaId = payload.entry[0].changes[0].value.media.id;

    if (
      !commentId ||
      !commenterUsername ||
      !mediaOwnerId ||
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
      media: { mediaOwnerId, mediaId },
    };
  }

  async respondToComment(
    commentId: string,
    message: string,
    accountId: number,
  ) {
    const accessToken = await this.getInstagramAccessToken({ accountId });

    const url = `https://graph.instagram.com/v22.0/${commentId}/replies`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Failed to respond to comment: ${errorBody}`);
      throw new InternalServerErrorException(
        `Failed to respond to comment: ${response.status}`,
      );
    }

    return response.json();
  }

  async sendDM(
    { comment: { commentId }, media: { mediaOwnerId } }: any,
    message: string,
    accountId: number,
  ) {
    const accessToken = await this.getInstagramAccessToken({ accountId });

    const url = `https://graph.instagram.com/${mediaOwnerId}/messages`;
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
  }

  async sendDmForExistingConversation(
    recipientId: string,
    message: string,
    accountId: number,
  ) {
    const accessToken = await this.getInstagramAccessToken({ accountId });
    const { id, username } = await this.getMyDetails({ accountId });

    const url = `https://graph.instagram.com/${id}/messages`;

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
      this.logger.error(`Failed to send DM in conversation: ${errorBody}`);
      throw new InternalServerErrorException(
        `Failed to send message to existing conversation`,
      );
    }

    return response.json();
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
  // async handleComment(payload: any) {
  //   try {
  //     const {
  //       comment: { commentId, commenterId, commenterUsername },
  //       post: { postOwnerId },
  //     } = this.extractCommentDetails(payload);

  //     if (commenterId !== postOwnerId) {
  //       const response = await this.respondToComment(
  //         commentId,
  //         `@${commenterUsername} Check DM`,
  //       );

  //       const { id: respondedCommentId } = await response.data;

  //       const postInfo = await this.getPostInfoByReplyId(respondedCommentId);

  //       await this.saveReplyInfo(postInfo);

  //       await this.sendDM(
  //         postOwnerId,
  //         commentId,
  //         `hey ${commenterUsername} here is your 5%OFF coupon code SLVAAM`,
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error('Error handling comment event', error.stack);
  //     throw error;
  //   }
  // }

  private getActionCb(actiontype) {
    if (actiontype === 'extractLeads') {
      return registeredActions.extractLeads;
    }
    throw new Error('this type of action does not exist');
  }

  async getPrompt({
    action,
    conversationHistory,
    trigger,
    commentText,
    dmText,
  }: GetPromptInput) {
    const {
      type: actiontype,
      information: extractInformation,
      extra: additionalInformation,
    } = action;
    const actionCb = this.getActionCb(actiontype);
    if (commentText) {
      const { COMMENTS } = INSTAGRAM_EVENTS;
      const prompt = actionCb({
        eventType: COMMENTS,
        conversationHistory,
        trigger,
        latestConversation: commentText,
        extractInformation,
        additionalInformation,
      });
      return prompt;
    } else if (dmText) {
      const { DM_RECEIVED } = INSTAGRAM_EVENTS;
      const prompt = actionCb({
        eventType: DM_RECEIVED,
        conversationHistory,
        trigger,
        latestConversation: dmText,
        extractInformation,
        additionalInformation,
      });
      return prompt;
    }
    throw new Error('Unidentified event cannot generate prompt');
  }

  private sanitizeCommentPayload(payload: any) {
    const commentId = payload.entry[0].changes[0].value.id;
    const commenterUsername = payload.entry[0].changes[0].value.from.username;
    const mediaOwnerId = payload.entry[0].id;
    const commenterId = payload.entry[0].changes[0].value.from.id;
    const commentText = payload.entry[0].changes[0].value.text;
    const mediaId = payload.entry[0].changes[0].value.media.id;

    if (
      !commentId ||
      !commenterUsername ||
      !mediaOwnerId ||
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
      media: { mediaOwnerId, mediaId },
    };
  }

  private sanitizeDMPayload(payload: any) {
    const messagingEvent = payload?.entry?.[0]?.messaging?.[0];

    const messageId = messagingEvent?.message?.mid;
    const messageText = messagingEvent?.message?.text;
    const senderId = messagingEvent?.sender?.id;
    const recipientId = messagingEvent?.recipient?.id;
    const timestamp = messagingEvent?.timestamp;

    if (!messageId || !messageText || !senderId || !recipientId || !timestamp) {
      this.logger.error('Missing required fields in DM event payload');
      throw new Error('Invalid DM event payload');
    }

    return {
      message: {
        messageId,
        senderId,
        recipientId,
        messageText,
        timestamp,
      },
    };
  }

  async handleComment(webhookPayload: any, accountId: number) {
    const payload = this.sanitizeCommentPayload(webhookPayload);
    try {
      const {
        comment: { commentText, commenterId },
        media: { mediaId },
      } = payload;
      const automation = await this.automationService.findByMedia(mediaId);
      if (!automation) {
        return;
      }
      const { action } = automation;
      const conversationHistory = await this.getConversation(
        commenterId,
        accountId,
      );
      const prompt = await this.getPrompt({
        action,
        conversationHistory,
        trigger: commentText,
        commentText,
      });

      const response = await this.geminiService.queryGemini(prompt, accountId);
      await this.prismaService.userProgress.upsert({
        where: { userId: commenterId },
        update: { automationId: automation.id, trigger: commentText },
        create: {
          automationId: automation.id,
          userId: commenterId,
          trigger: commentText,
        },
      });

      if (!response) {
        return;
      }
      await this.sendDM(payload, response, accountId);
    } catch (error) {
      this.logger.error('Error handling comment event', error.stack);
      throw error;
    }
  }

  async handleDM(webhookPayload: string, accountId: number) {
    const payload = this.sanitizeDMPayload(webhookPayload);
    const {
      message: { senderId, messageText },
    } = payload;

    const userProgress = await this.prismaService.userProgress.findUnique({
      where: { userId: senderId },
      include: { automation: true },
    });
    if (!userProgress) {
      return;
    }
    const {
      automation: { action },
      trigger,
    } = userProgress;
    const conversationHistory = await this.getConversation(senderId, accountId);
    const prompt = await this.getPrompt({
      action,
      conversationHistory,
      trigger,
      dmText: messageText,
    });
    const response = await this.geminiService.queryGemini(prompt, accountId);
    if (!response) {
      return;
    }
    await this.sendDmForExistingConversation(senderId, response, accountId);
  }

  async getAllPosts({
    limit = 10,
    accountId,
  }: {
    limit?: number;
    accountId: number;
  }) {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });

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
  async getCommentsByPostId(postId: string, accountId: number) {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });

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

  async getPostInfoByReplyId(commentId: string, accountId: number) {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });

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

  async getConversation(userId: string, accountId: number) {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });

      const response = await fetch(
        `https://graph.instagram.com/v22.0/me/conversations?user_id${userId}&access_token=${accessToken}&fields=messages{id,created_time,from,message}`,
      );

      const { data } = await response.json();
      const messages = data[0]?.messages?.data || [];

      // Filter messages where sender id === userId
      const filteredMessages = messages.filter(
        (msg: any) => msg.from?.id === userId,
      );

      return filteredMessages;
    } catch (error) {
      this.logger.error('Error fetching Instagram conversation', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram conversation',
      );
    }
  }

  async getPostInfoByMediaId(mediaId: string, accountId: number) {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });

      const response = await fetch(
        `https://graph.instagram.com/v22.0/${mediaId}?fields=id,media_type,media_url,owner,timestamp&access_token=${accessToken}`,
      );
      return await response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram post info', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram post info',
      );
    }
  }
}
