import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { MemberStatus } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.createAccount(createAccountDto);
  }

  @Get()
  findAllAccounts() {
    return this.accountService.findAllAccounts();
  }

  @Get(':id')
  findAccountById(@Param('id') id: string) {
    return this.accountService.findAccountById(id);
  }

  @Patch(':id')
  updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  removeAccount(@Param('id') id: string) {
    return this.accountService.removeAccount(id);
  }

  // ==================== Member Management ====================

  @Post(':accountId/members')
  addMemberToAccount(
    @Param('accountId') accountId: string,
    @Body() body: { memberId: string; status: MemberStatus; scope: string[] },
  ) {
    const { memberId, scope, status } = body;
    return this.accountService.addMemberToAccount({
      accountId,
      memberId,
      status,
      scope,
    });
  }

  @Get(':accountId/members')
  listMembersOfAccount(@Param('accountId') accountId: string) {
    return this.accountService.listMembersOfAccount(accountId);
  }

  @Get(':memberId/accounts')
  listAccountsOfMember(@Param('memberId') memberId: string) {
    console.log(memberId)
    return this.accountService.listAccountsOfMember(memberId);
  }

  @Patch('members/:accountMemberId')
  updateMemberInAccount(
    @Param('accountMemberId') accountMemberId: string,
    @Body() { status, scope }: { status?: MemberStatus; scope?: string[] },
  ) {
    return this.accountService.updateMemberInAccount(accountMemberId, {
      status,
      scope,
    });
  }

  @Delete('members/:accountMemberId')
  removeMemberFromAccount(@Param('accountMemberId') accountMemberId: string) {
    return this.accountService.removeMemberFromAccount(accountMemberId);
  }
}
