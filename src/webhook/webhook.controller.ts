import { Controller, Get, Param, Query } from '@nestjs/common';
import { WEBHOOK_PROVIDERS } from './types/webhook.types';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get(':provider')
  verifyWebhook(
    @Param('provider') provider: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
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
    if (!this.webhookService.verifyWebhook(verifyToken)) {
      return {
        message: 'Invalid token.',
      };
    }
    return challenge;
  }
}
