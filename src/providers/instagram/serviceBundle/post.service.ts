import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrivateInfoService } from './privateInfo.service';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly privateInfoService: PrivateInfoService) {}
  async getAllPosts({
    limit = 10,
    accountId,
  }: {
    limit?: number;
    accountId: number;
  }) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        { accountId },
      );

      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp&limit=${limit}&access_token=${accessToken}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new InternalServerErrorException(
          `Instagram API Error: ${response.status} - ${errorBody}`,
        );
      }

      return response.json();
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
}
