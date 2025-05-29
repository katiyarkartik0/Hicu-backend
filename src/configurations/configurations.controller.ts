import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationsDto } from './dto/create-configurations.dto';

@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Post()
  create(@Body() createConfigurationsDto: CreateConfigurationsDto) {
    return this.configurationsService.create(createConfigurationsDto);
  }

  @Get('one')
  async getConfigurationForAccount(
    @Query('accountId', ParseIntPipe) accountId: number,
    @Query('integrationId', ParseIntPipe) integrationId: number,
  ) {
    return (
      (await this.configurationsService.getConfigurationForAccount({
        accountId,
        integrationId,
      })) || {}
    );
  }

  @Get('all')
  async getConfigurationsForAccount(
    @Query('accountId', ParseIntPipe) accountId: number,
  ) {
    return (
      (await this.configurationsService.getConfigurationsForAccount({
        accountId,
      })) || {}
    );
  }
}
