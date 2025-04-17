import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { InstagramModule } from './providers/instagram/instagram.module';

@Module({
  imports: [InstagramModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
