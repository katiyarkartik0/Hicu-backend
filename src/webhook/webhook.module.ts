import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { InstagramModule } from '../providers/instagram/instagram.module';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { IgWebhookHandlerModule } from 'src/igWebhookHandler/igWebhookHandler.module';

@Module({
  imports: [InstagramModule, ConfigurationsModule, IgWebhookHandlerModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
