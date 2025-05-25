import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountMemberService } from './account-member.service';
import { MemberStatus } from '@prisma/client';

@Controller('account-member')
export class AccountMemberController {
  constructor(private readonly accountMemberService: AccountMemberService) {}

  @Post()
  addMemberToAccount(
    @Body()
    body: {
      accountId: number;
      memberId: number;
      status: MemberStatus;
      scope: string[];
    },
  ) {
    return this.accountMemberService.addMemberToAccount(body);
  }

  @Get('/members/:accountId')
  listMembersOfAccount(@Param('accountId') accountId: number) {
    return this.accountMemberService.listMembersOfAccount(accountId);
  }

  @Get('accounts/:memberId')
  listAccountsOfMember(@Param('memberId') memberId: number) {
    console.log(memberId);
    return this.accountMemberService.listAccountsOfMember(memberId);
  }

  @Patch()
  updateMemberInAccount(
    @Body()
    {
      accountMemberId,
      status,
      scope,
    }: {
      accountMemberId: number;
      status?: MemberStatus;
      scope?: string[];
    },
  ) {
    return this.accountMemberService.updateMemberInAccount(accountMemberId, {
      status,
      scope,
    });
  }

  @Delete(':accountMemberId')
  deleteAccountMember(@Param('accountMemberId') accountMemberId: number) {
    return this.accountMemberService.removeMemberFromAccount(accountMemberId);
  }
}
