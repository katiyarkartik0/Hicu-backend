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
  async createAccount(@Body() createAccountDto: AccountDto) {
    const data = await this.accountService.createAccount(createAccountDto);
    return { data };
  }

  @Get()
  async findAllAccounts() {
    const data = await this.accountService.findAllAccounts();
    return { data };
  }

  @Get(':id')
  async findAccountById(@Param('id') id: number) {
    const data = await this.accountService.findAccountById(id);
    return { data };
  }

  @Patch(':id')
  async updateAccount(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const data = this.accountService.updateAccount(id, updateAccountDto);
    return { data };
  }

  @Delete(':id')
  async removeAccount(@Param('id') id: number) {
    const data = this.accountService.removeAccount(id);
    return { data };
  }
}
