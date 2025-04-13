import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Get,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InstagramService } from './instagram.service';
import { INSTAGRAM_EVENTS } from './constants/instagram.events';

@Controller('webhook/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  private getInstagramEventType(body: any): string {
    const { INVALID, DM_RECEIVED, DM_ECHO, COMMENTS, UNKNOWN } =
      INSTAGRAM_EVENTS;

    if (!body || !body.entry || !Array.isArray(body.entry)) {
      return INVALID;
    }

    const entry = body.entry[0];

    if (entry.changes?.[0]?.field === COMMENTS) {
      return COMMENTS;
    }

    if (entry.messaging?.[0]) {
      const messagingEvent = entry.messaging[0];
      return messagingEvent.message?.is_echo ? DM_ECHO : DM_RECEIVED;
    }

    return UNKNOWN;
  }

  @Post()
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const { COMMENTS } = INSTAGRAM_EVENTS;
      const eventType = this.getInstagramEventType(req.body);
      switch (eventType) {
        case COMMENTS:
          await this.instagramService.handleCommentEvent(req.body);
          return res.status(200).json({ response: 'success' });
        default:
          return res.status(400).json({ error: 'Unhandled event type' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}