import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { Leads as LeadsAsked } from './dto/create-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() createLeadDto: LeadsAsked) {
    const leadsAsked = await this.leadsService.create(createLeadDto);
    return { data: leadsAsked };
  }

  @Get(':accountId')
  async findByAccount(@Param('accountId') accountId: number) {
    const leads = await this.leadsService.findByAccount(accountId);
    return { data: leads };
  }

  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateLeadDto: Partial<LeadsAsked>,
  ) {
    const data = await this.leadsService.update(id, updateLeadDto);
    return { data };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(+id);
  }
}
