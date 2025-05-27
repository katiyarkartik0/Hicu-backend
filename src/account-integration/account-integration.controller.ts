import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AccountIntegrationService } from './account-integration.service';
import { CreateAccountIntegrationDto } from './dto/create-account-integration.dto';
import { UpdateAccountIntegrationDto } from './dto/update-account-integration.dto';

@Controller('account-integration')
export class AccountIntegrationController {
  constructor(
    private readonly accountIntegrationService: AccountIntegrationService,
  ) {}

  @Post()
  create(@Body() createAccountIntegrationDto: CreateAccountIntegrationDto) {
    return this.accountIntegrationService.create(createAccountIntegrationDto);
  }

  @Get()
  findAll() {
    return this.accountIntegrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountIntegrationService.findOne(+id);
  }

  @Get('configurations')
  findConfiguration(
    @Query('accountId') accountId: number,
    @Query('integrationId') integrationId: number,
  ) {
    return this.accountIntegrationService.getAccountConfiguration({
      accountId,
      integrationId,
    });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountIntegrationDto: UpdateAccountIntegrationDto,
  ) {
    return this.accountIntegrationService.update(
      +id,
      updateAccountIntegrationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountIntegrationService.remove(+id);
  }
}
