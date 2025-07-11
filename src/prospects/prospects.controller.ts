import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { Prospect } from './dto/create-prospect.dto';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  async create(@Body() createProspectDto: Prospect) {
    const prospect = await this.prospectsService.create(createProspectDto);
    return { data: prospect };
  }

  @Get(':accountId')
  findAll(@Param('accountId') accountId: number) {
    const prospects = this.prospectsService.findAll(accountId);
    return { data: prospects };
  }
}
