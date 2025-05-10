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

  // @Post()
  // async handleWebhook(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const { COMMENTS } = INSTAGRAM_EVENTS;
  //     const eventType = this.getInstagramEventType(req.body);
  //     switch (eventType) {
  //       case COMMENTS:
  //         await this.instagramService.handleBotCommentEvent(req.body);
  //         return res.status(200).json({ response: 'success' });
  //       default:
  //         return res.status(400).json({ error: 'Unhandled event type' });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  // @Post()
  // async handleWebhook(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const { COMMENTS, DM_RECEIVED } = INSTAGRAM_EVENTS;
  //     const eventType = this.instagramService.getInstagramEventType(req.body);
  //     switch (eventType) {
  //       case DM_RECEIVED:
  //         await this.instagramService.handleDM(req.body);
  //       case COMMENTS:
  //         await this.instagramService.handleComment(req.body);
  //         return res.status(200).json({ response: 'success' });
  //       default:
  //         return res.status(400).json({ error: 'Unhandled event type' });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

  @Get()
  async getAllPosts() {}
}
