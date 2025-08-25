import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { CommentsService } from './instagram/comments/comments.service';
import { INSTAGRAM_EVENTS } from 'src/shared/constants/instagram/events.constants';
import { DmsService } from './instagram/dms/dms.service';
import { eventHelpers } from './helpers';

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    private readonly instagramService: InstagramService,
    private readonly igCommentsService: CommentsService,
    private readonly igDmService: DmsService,
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
      const { COMMENTS, DM_RECEIVED } = INSTAGRAM_EVENTS;
      const eventType = await this.getInstagramEventType(payload, accountId);
      switch (eventType) {
        case DM_RECEIVED:
          await this.igDmService.handleDm(payload, accountId);
          break;
        case COMMENTS:
          await this.igCommentsService.handleComment(payload, accountId);
          break;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
}
