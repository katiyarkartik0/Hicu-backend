import { Module } from '@nestjs/common';

import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';
import { LeadsModule } from 'src/leads/leads.module';
import { ProspectsModule } from 'src/prospects/prospects.module';

import { CommentGraphService } from './comment-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { GeminiPromptService } from './ai.service';
import { CommentsService } from './comments.service';

@Module({
  providers: [
    CommentsService,
    CommentGraphService,
    InstagramUtilsService,
    GeminiPromptService,
  ],
  imports: [
    InstagramModule,
    GeminiModule,
    AutomationsModule,
    ShopifyModule,
    PineconeModule,
    LeadsModule,
    ProspectsModule,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}