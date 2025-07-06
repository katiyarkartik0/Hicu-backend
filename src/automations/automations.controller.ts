import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { Automation, IgCommentAutomation } from './automations.types';
import { IgDmAutomation } from '@prisma/client';

@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Post()
  async create(@Body() createAutomationDto: Omit<Automation, 'id'>) {
    const automation =
      await this.automationsService.create(createAutomationDto);
    return { data: automation };
  }

  @Get()
  async findAll(@Query('accountId') accountId: number) {
    const automations = await this.automationsService.findAll({ accountId });
    return { data: automations };
  }

  @Delete(':automationId')
  async delete(@Param('automationId', ParseIntPipe) automationId: number) {
    return this.automationsService.remove(automationId);
  }

  @Post('/igComment')
  commentAutomation(@Body() body: Omit<IgCommentAutomation, 'id'>) {
    return this.automationsService.createIgCommentAutomation(body);
  }

  @Post('/igDm')
  dmAutomation(@Body() body: Omit<IgDmAutomation, 'id'>) {
    return this.automationsService.createIgDmAutomation(body);
  }

  @Get('/igComment')
  async findAllIgCommentAutomations(@Query('accountId') accountId: number) {
    const automations = await this.automationsService.findAllIgCommentAutomation({ accountId });
    return { data: automations };
  }
}
