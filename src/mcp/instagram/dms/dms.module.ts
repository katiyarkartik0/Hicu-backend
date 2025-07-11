import { Module } from '@nestjs/common';
import { DmsService } from './dms.service';
import { DmsController } from './dms.controller';
import { DmGraphService } from './dm-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { AiService } from './ai.service';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';
import { LeadsModule } from 'src/leads/leads.module';
import { ProspectsModule } from 'src/prospects/prospects.module';

@Module({
  controllers: [DmsController],
  imports: [
    InstagramModule,
    GeminiModule,
    AutomationsModule,
    ShopifyModule,
    PineconeModule,
    LeadsModule,
    ProspectsModule,
  ],
  exports: [DmsService],
  providers: [DmsService, DmGraphService, InstagramUtilsService, AiService],
})
export class DmsModule {}
