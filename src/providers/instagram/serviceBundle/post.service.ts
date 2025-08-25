import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrivateInfoService } from './privateInfo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly privateInfoService: PrivateInfoService,
    private readonly prismaService: PrismaService,
  ) {}
  private async getAllPostsFromIg({
    limit = 10,
    accountId,
  }: {
    limit?: number;
    accountId: number;
  }) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        {
          accountId,
        },
      );

      let url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp&limit=${limit}&access_token=${accessToken}`;
      const allPosts: any[] = [];

      while (url) {
        const response = await fetch(url);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new InternalServerErrorException(
            `Instagram API Error: ${response.status} - ${errorBody}`,
          );
        }

        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          allPosts.push(...data.data);
        }

        // Continue if paging.next exists, otherwise stop
        url = data.paging?.next || null;
      }

      return allPosts;
    } catch (error) {
      this.logger.error('Error fetching Instagram posts', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram posts',
        error.message,
      );
    }
  }
  async getPostInfoByReplyId(commentId: string, accountId: number) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        { accountId },
      );

      const response = await fetch(
        `https://graph.instagram.com/${commentId}?fields=id,parent_id,media,text,from{id,username}&access_token=${accessToken}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new InternalServerErrorException(
          `Instagram API Error: ${response.status} - ${errorBody}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram comments', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram comments',
        error.message,
      );
    }
  }
  async getPostInfoByMediaId(mediaId: string, accountId: number) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        { accountId },
      );

      const response = await fetch(
        `https://graph.instagram.com/v22.0/${mediaId}?fields=id,media_type,media_url,owner,timestamp&access_token=${accessToken}`,
      );
      return await response.json();
    } catch (error) {
      this.logger.error('Error fetching Instagram post info', error.stack);
      throw new InternalServerErrorException(
        'Failed to fetch Instagram post info',
        error.message,
      );
    }
  }
  async syncPosts(accountId: number, limit = 100) {
    try {
      // 1️⃣ Fetch all posts
      const allPosts = await this.getAllPostsFromIg({ accountId, limit });

      // 2️⃣ Upsert each post
      for (const post of allPosts) {
        await this.prismaService.igMedia.upsert({
          where: { id: post.id },
          update: {
            caption: post.caption ?? null,
            mediaUrl: post.media_url,
            mediaType: post.media_type,
            timestamp: new Date(post.timestamp),
          },
          create: {
            id: post.id,
            accountId,
            caption: post.caption ?? null,
            mediaUrl: post.media_url,
            mediaType: post.media_type,
            timestamp: new Date(post.timestamp),
          },
        });
      }

      return {
        message: `Synced ${allPosts.length} Instagram posts for account ${accountId}`,
      };
    } catch (error) {
      this.logger.error('Error syncing Instagram posts', error.stack);
      throw new InternalServerErrorException(
        'Failed to sync Instagram posts',
        error.message,
      );
    }
  }

  async getAllSavedPosts({ accountId }: { accountId: number }) {
    return this.prismaService.igMedia.findMany({ where: { accountId } });
  }
}
