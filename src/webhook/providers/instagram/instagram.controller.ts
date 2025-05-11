import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InstagramService } from './instagram.service';
import { INSTAGRAM_EVENTS } from './constants/instagram.events';

@Controller('/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('/post')
  async getAllPosts() {
    return await this.instagramService.getAllPosts({ limit: 10 });
  }
  @Get('/post/:id')
  async getPostById(@Param('id') id: string) {
    const post = await this.instagramService.getPostInfoByMediaId(id);
    return post;
  }
}
