import { Module } from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { ProspectsController } from './prospects.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ProspectsController],
  providers: [ProspectsService],
  imports: [PrismaModule],
  exports: [ProspectsService],
})
export class ProspectsModule {}
