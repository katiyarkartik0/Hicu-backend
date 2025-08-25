import { Controller, Get, Query, Param, UseGuards, Post } from '@nestjs/common';

import { InstagramService } from './instagram.service';

import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('/post')
  async getAllSavedPosts(@Query('accountId') accountId: number) {
    return await this.instagramService.getAllSavedPosts({ accountId });
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

  @Post('syncProfile')
  async syncProfile(@Query('accountId') accountId: number) {
    return await this.instagramService.syncProfile(accountId);
  }

  @Post('syncPosts')
  async syncPosts(@Query('accountId') accountId: number) {
    return await this.instagramService.syncPosts(accountId);
  }
}
