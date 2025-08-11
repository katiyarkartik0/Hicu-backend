import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';

import { AutomationsService } from './automations.service';

import { AuthGuard } from 'src/auth/auth.guard';

import type { IgDmAutomation } from '@prisma/client';
import type { IgCommentAutomation } from './automations.types';

@UseGuards(AuthGuard)
@Controller('automations')
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

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
    const automations =
      await this.automationsService.findAllIgCommentAutomation({ accountId });
    return { data: automations };
  }
}
