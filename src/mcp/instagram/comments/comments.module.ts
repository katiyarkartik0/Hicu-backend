import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';
import { CommentGraphService } from './comment-graph.service';
import { InstagramUtilsService } from '../instagram-utils.service';
import { GeminiPromptService } from './gemini-prompt.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LeadsModule } from 'src/leads/leads.module';

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
    PrismaModule,
    LeadsModule
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
