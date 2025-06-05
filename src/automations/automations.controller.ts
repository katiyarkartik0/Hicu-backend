import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  create(@Body() createAutomationDto: CreateAutomationDto) {
    return this.automationsService.create(createAutomationDto);
  }

  @Get()
  async findAll(@Query('accountId') accountId: number) {
    const automations = await this.automationsService.findAll({ accountId });
    return automations;

  }

  @Get(':mediaId')
  async findOne(@Param('mediaId') mediaId: string) {
    const automation =  await this.automationsService.findByMedia(mediaId);
    return automation;
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAutomationDto: UpdateAutomationDto) {
  //   return this.automationsService.update(id, updateAutomationDto);
  // }

  @Delete(':automationId')
  async delete(@Param('automationId', ParseIntPipe) automationId: number) {
    return this.automationsService.remove(automationId);
  }
}
