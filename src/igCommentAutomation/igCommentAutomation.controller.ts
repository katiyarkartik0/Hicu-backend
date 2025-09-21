import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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

  @Get('findAll/:mediaId')
  async findAllByMedia(@Param('mediaId') mediaId: string) {
    const data =
      await this.igCommentAutomationService.findAllByMediaId(mediaId);
    return { data };
  }

  @Get('findFirst/:mediaId')
  async findFirstByMediaId(@Param('mediaId') mediaId: string) {
    const data =
      await this.igCommentAutomationService.findFirstByMediaId(mediaId);
    return { data };
  }

  @Patch('activate/:id')
  async activate(@Param('id') id: string) {
    const data = await this.igCommentAutomationService.activateAutomation(
      Number(id),
    );
    return { data };
  }

  @Patch('deactivate/:id')
  async deactivate(@Param('id') id: string) {
    const data = await this.igCommentAutomationService.deactivateAutomation(
      Number(id),
    );
    return { data };
  }
}
