import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { InstagramModule } from './providers/instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  imports: [InstagramModule, ConfigurationsModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}
