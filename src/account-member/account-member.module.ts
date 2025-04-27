import { Module } from '@nestjs/common';
import { AccountMemberService } from './account-member.service';
import { AccountMemberController } from './account-member.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountMemberController],
  providers: [AccountMemberService],
  exports: [AccountMemberService],
})
export class AccountMemberModule {}
