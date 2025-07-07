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

  @Get()
  findAll() {
    return this.prospectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prospectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProspectDto) {
    return this.prospectsService.update(+id, updateProspectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prospectsService.remove(+id);
  }
}
