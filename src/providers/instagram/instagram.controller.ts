import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('/post')
  async getAllPosts(@Query('accountId') accountId: number) {
    return await this.instagramService.getAllPosts({ limit: 10, accountId });
  }
  @Get('/post/:id')
  async getPostById(
    @Param('id') id: string,
    @Query('accountId') accountId: number,
  ) {
    const post = await this.instagramService.getPostInfoByMediaId(
      id,
      accountId,
    );
    return post;
  }

  @Get('profile')
  async getDetails(@Query('accountId') accountId: number) {
    return await this.instagramService.getMyDetails({ accountId });
  }
}
