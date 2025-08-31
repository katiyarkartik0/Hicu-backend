import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { INSTAGRAM_EVENTS } from 'src/shared/constants/instagram/events.constants';
import { eventHelpers } from './helpers';
import { SanitizedCommentPayload } from 'src/providers/instagram/instagram.types';
import { CommentService } from './comment/index.service';
import { UtilsService } from './utils.service';
import { DmService } from './dm/index.service';

@Injectable()
export class IgMcpService {
  private readonly logger = new Logger(IgMcpService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly commentService: CommentService,
    private readonly dmService: DmService,
    private readonly utilsService: UtilsService,
  ) {}

  private async isCommentFromSelf(
    comment: any,
    accountId: number,
  ): Promise<boolean> {
    const commenterId = comment.from?.id;
    const commenterUsername = comment.from?.username;

    if (!commenterId || !commenterUsername) return false;

    const { igUserId: myId, igUsername: myUsername } =
      await this.instagramService.getMyDetails({
        accountId,
      });

    return commenterId === myId || commenterUsername === myUsername;
  }

  private async getInstagramEventType(
    body: any,
    accountId: number,
  ): Promise<string> {
    try {
      const { INVALID, DM_RECEIVED, DM_ECHO, COMMENTS, COMMENT_ECHO, UNKNOWN } =
        INSTAGRAM_EVENTS;
      if (!eventHelpers.isValidWebhookEvent(body)) {
        return INVALID;
      }

      if (eventHelpers.isValidCommentEvent(body)) {
        const entry = body.entry[0];
        const comment = entry.changes?.[0]?.value;
        const isFromSelf = await this.isCommentFromSelf(comment, accountId);
        return isFromSelf ? COMMENT_ECHO : COMMENTS;
      }

      // ✅ Handle DM Event
      if (eventHelpers.isValidDmEvent(body)) {
        const entry = body.entry[0];
        const messagingEvent = entry.messaging?.[0];
        const isDmRecieved = !messagingEvent.message.is_echo;
        return isDmRecieved ? DM_RECEIVED : DM_ECHO;
      }

      return UNKNOWN;
    } catch (error) {
      this.logger.error(
        `Error determining Instagram event type: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to determine event type');
    }
  }

  async handleIgWebhook(payload: any, accountId: number) {
    try {
      const { COMMENTS, DM_RECEIVED, COMMENT_ECHO } = INSTAGRAM_EVENTS;
      const eventType = await this.getInstagramEventType(payload, accountId);
      switch (eventType) {
        case DM_RECEIVED:
          await this.dmService.handleDm(payload, accountId);
          break;
        case COMMENTS:
          const sanitizedPayloadComment: SanitizedCommentPayload =
            this.utilsService.sanitizeCommentPayload(payload);
          await this.saveComment(sanitizedPayloadComment, accountId);
          await this.commentService.handleComment(payload, accountId);
          break;
        case COMMENT_ECHO:
          const sanitizedPayloadCommentEcho: SanitizedCommentPayload =
            this.utilsService.sanitizeCommentPayload(payload);
          await this.saveComment(sanitizedPayloadCommentEcho, accountId);
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  async saveComment(payload: SanitizedCommentPayload, accountId: number) {
    return await this.instagramService.saveComment({
      accountId,
      id: payload.comment.commentId,
      text: payload.comment.commentText,
      username: payload.comment.commenterUsername,
      userId: payload.comment.commenterId,
      mediaOwnerId: payload.comment.mediaOwnerId,
      mediaId: payload.comment.mediaId,
      parentCommentId: payload.comment.parentCommentId,
      timestamp: payload.comment.timestamp,
      isReply: payload.comment.isReply,
    });
  }
}
