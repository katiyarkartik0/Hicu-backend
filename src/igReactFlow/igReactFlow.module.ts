import { Module } from '@nestjs/common';
import { IgReactFlowController } from './igReactFlow.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IgReactFlowService } from './igReactFlow.service';

@Module({
  controllers: [IgReactFlowController],
  exports: [],
  imports: [PrismaModule],
  providers: [IgReactFlowService],
})
export class IgReactFlowModule {}