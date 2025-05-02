import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
