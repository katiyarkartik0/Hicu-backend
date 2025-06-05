import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WEBHOOK_PROVIDERS } from './types/webhook.types';
import { WebhookService } from './webhook.service';
import { INSTAGRAM_EVENTS } from './providers/instagram/constants/instagram.events';
import { InstagramService } from './providers/instagram/instagram.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly instagramService: InstagramService,
  ) {}

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
  @Get(':provider')
  async verifyWebhook(
    @Param('provider') provider: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('accountId') accountId: number,
  ) {
    if (!WEBHOOK_PROVIDERS[provider.toUpperCase()]) {
      return {
        message: `${provider} is not a supported yet.`,
      };
    }
    if (mode !== 'subscribe') {
      return {
        message: 'Invalid mode.',
      };
    }

    if (!(await this.webhookService.verifyWebhook(verifyToken, accountId))) {
      return {
        message: 'Invalid token.',
      };
    }
    return challenge;
  }

  @Post(':provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Query('accountId') accountId: number,
    @Body() body: any,
  ) {
    const { INSTAGRAM } = WEBHOOK_PROVIDERS;

    if (!accountId) {
      throw new BadRequestException(
        'Missing required query parameter: accountId',
      );
    }

    if (provider === INSTAGRAM) {
      return this.processInstagramWebhook(body, accountId);
    } else if (!WEBHOOK_PROVIDERS.hasOwnProperty(provider)) {
      throw new BadRequestException('Unsupported provider');
    }
  }

  private async processInstagramWebhook(payload: any, accountId: number) {
    try {
      const { COMMENTS, DM_RECEIVED } = INSTAGRAM_EVENTS;
      const eventType = await this.instagramService.getInstagramEventType(
        payload,
        accountId,
      );
      switch (eventType) {
        case DM_RECEIVED:
          await this.instagramService.handleDM(payload, accountId);
          break;
        case COMMENTS:
          await this.instagramService.handleComment(payload, accountId);
          break;
      }
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
}
