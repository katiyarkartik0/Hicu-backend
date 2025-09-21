import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { WEBHOOK_PROVIDERS } from './types/webhook.types';
import { WebhookService } from './webhook.service';
import { IgWebhookHandlerService } from 'src/igWebhookHandler/igWebhookHandler.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly igWebhookHandlerService: IgWebhookHandlerService,
  ) {}

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
      this.igWebhookHandlerService.handleIgWebhook(body, accountId);
      return { message: 'ok' };
    } else if (!WEBHOOK_PROVIDERS.hasOwnProperty(provider)) {
      throw new BadRequestException('Unsupported provider');
    }
  }
}
