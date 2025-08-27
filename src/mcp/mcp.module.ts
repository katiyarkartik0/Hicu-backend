import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { CommentsModule } from './instagram/comments/comments.module';
import { DmsModule } from './instagram/dms/dms.module';
import { InstagramUtilsService } from './instagram/instagram-utils.service';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Module({
  imports: [InstagramModule, CommentsModule, DmsModule],
  providers: [
    McpService,
    InstagramUtilsService,
    GeminiService,
    ConfigurationsService,
    PrismaService,
    EncryptionService,
  ],
  controllers: [],
  exports: [McpService],
})
export class McpModule {}
