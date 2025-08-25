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
import { AccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  createAccount(@Body() createAccountDto: AccountDto) {
    return this.accountService.createAccount(createAccountDto);
  }

  @Get()
  findAllAccounts() {
    return this.accountService.findAllAccounts();
  }

  @Get(':id')
  findAccountById(@Param('id') id: number) {
    return this.accountService.findAccountById(id);
  }

  @Patch(':id')
  updateAccount(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  removeAccount(@Param('id') id: number) {
    return this.accountService.removeAccount(id);
  }
}
