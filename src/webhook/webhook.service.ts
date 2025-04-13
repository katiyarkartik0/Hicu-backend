import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  WEBHOOK_SECRET: string | undefined;
  constructor(private readonly configService: ConfigService) {
    this.WEBHOOK_SECRET = this.configService.get('WEBHOOK_SECRET');
    if (!this.WEBHOOK_SECRET) throw new Error('WEBHOOK_SECRET is not defined');
  }
  
  verifyWebhook(token: string) {
    return token === this.WEBHOOK_SECRET;
  }
}
