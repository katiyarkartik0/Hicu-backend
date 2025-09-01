import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { Prospect } from './dto/create-prospect.dto';
import { Prisma } from '@prisma/client';

@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  async create(
    @Body()
    createProspectDto: Omit<Prospect, 'details'> & {
      details: Prisma.JsonObject;
    },
  ) {
    const prospect = await this.prospectsService.create(createProspectDto);
    return { data: prospect };
  }

  @Get(':accountId')
  async findAll(@Param('accountId') accountId: number) {
    const prospects = await this.prospectsService.findAll(accountId);
    return { data: prospects };
  }

  @Get()
  async findOne(
    @Query('accountId', ParseIntPipe) accountId: number,
    @Query('userId') userId: string,
  ) {
    const prospect = await this.prospectsService.findByAccountIdUserId({
      accountId,
      userId,
    });
    return { data: prospect };
  }
}
