import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  create(@Body() createAutomationDto: any) {
    return this.automationsService.create(createAutomationDto);
  }

  @Get()
  findAll() {
    return this.automationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.automationsService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAutomationDto: UpdateAutomationDto) {
  //   return this.automationsService.update(id, updateAutomationDto);
  // }
}
