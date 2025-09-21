import { Module } from '@nestjs/common';
import { IgCommentAutomationController } from './igCommentAutomation.controller';
import { IgCommentAutomationService } from './igCommentAutomation.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  exports: [IgCommentAutomationService],
  imports: [PrismaModule],
  providers: [IgCommentAutomationService],
  controllers: [IgCommentAutomationController],
})
export class IgCommentAutomationModule {}