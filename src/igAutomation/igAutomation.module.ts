import { Module } from '@nestjs/common';
import { IgAutomationService } from './igAutomation.service';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { UtilsService } from './utils.service';
import { DmService } from './dm/index.service';

import { BabbageGraphService } from './dm/graphs/babbageGraph.service';
import { CommentService } from './comment/index.service';
import { AiService as DmAiService } from './dm/ai.service';
import { PineconeModule } from 'src/pinecone/pinecone.module';
import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { LeadsModule } from 'src/leads/leads.module';
import { ProspectsModule } from 'src/prospects/prospects.module';
import { IgCommentAutomationModule } from 'src/igCommentAutomation/igCommentAutomation.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AutomationNodeFactory } from './comment/automationNodeFactory';
import { GraphService } from './comment/graph.service';

@Module({
  imports: [
    InstagramModule,
    PineconeModule,
    GeminiModule,
    AutomationsModule,
    LeadsModule,
    ProspectsModule,
    IgCommentAutomationModule,
    PrismaModule,
  ],
  providers: [
    IgAutomationService,
    DmService,
    CommentService,
    BabbageGraphService,
    UtilsService,
    DmAiService,
    AutomationNodeFactory,
    GraphService
  ],
  controllers: [],
  exports: [IgAutomationService],
})
export class IgAutomationModule {}