import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountMemberService } from './account-member.service';
import { CreateAccountMemberDto } from './dto/create-account-member.dto';
import { UpdateAccountMemberDto } from './dto/update-account-member.dto';

@Controller('account-member')
export class AccountMemberController {
  constructor(private readonly accountMemberService: AccountMemberService) {}

  @Post()
  create(@Body() createAccountMemberDto: CreateAccountMemberDto) {
    return this.accountMemberService.create(createAccountMemberDto);
  }

  @Get()
  findAll() {
    return this.accountMemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountMemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountMemberDto: UpdateAccountMemberDto) {
    return this.accountMemberService.update(+id, updateAccountMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountMemberService.remove(+id);
  }
}
