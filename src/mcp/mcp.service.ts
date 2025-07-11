import { Injectable } from '@nestjs/common';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { CommentsService } from './instagram/comments/comments.service';
import { INSTAGRAM_EVENTS } from 'src/shared/constants/instagram/events.constants';
import { DmsService } from './instagram/dms/dms.service';

@Injectable()
export class McpService {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly igCommentsService: CommentsService,
    private readonly igDmService:DmsService
  ) {}

  async handleIgWebhook(payload: any, accountId: number) {
    try {
      const { COMMENTS, DM_RECEIVED } = INSTAGRAM_EVENTS;
      const eventType = await this.instagramService.getInstagramEventType(
        payload,
        accountId,
      );
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
