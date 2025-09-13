import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IgCommentAutomationService } from './igCommentAutomation.service';

@Controller('/igCommentAutomation')
export class IgCommentAutomationController {
  constructor(
    private readonly igCommentAutomationService: IgCommentAutomationService,
  ) {}

  @Post()
  async create(
    @Body()
    dto: {
      name?: string;
      mediaId: string;
      accountId: number;
      commentAutomationId?: number;
    },
  ) {
    const data = this.igCommentAutomationService.createAutomation(dto);
    return { data };
  }

  @Get('media/:mediaId')
  async findAllByMedia(@Param('mediaId') mediaId: string) {
    const data =
      await this.igCommentAutomationService.findAllByMediaId(mediaId);
    return { data };
  }
}
