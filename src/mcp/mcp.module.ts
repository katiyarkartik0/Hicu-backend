import { Module } from '@nestjs/common';
import { McpService } from './mcp.service';
import { InstagramModule } from 'src/providers/instagram/instagram.module';
import { CommentsModule } from './instagram/comments/comments.module';

@Module({
  imports: [InstagramModule,CommentsModule],
  providers: [McpService],
  controllers: [],
  exports:[McpService]
})
export class McpModule {}
