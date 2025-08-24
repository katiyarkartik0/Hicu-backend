import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrivateInfoService } from './privateInfo.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IgCommentDto, SanitizedCommentPayload } from '../instagram.types';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly privateInfoService: PrivateInfoService,
    private readonly prismaService: PrismaService,
  ) {}

  async save(comment: Omit<IgCommentDto,"createdAt">) {
    return this.prismaService.igComment.create({ data: comment });
  }

  async respondToComment(
    commentId: string,
    message: string,
    accountId: number,
  ) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        {
          accountId,
        },
      );

      const url = `https://graph.facebook.com/v22.0/${commentId}/replies`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          access_token: accessToken,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Failed to respond to comment: ${errorBody}`);
        throw new InternalServerErrorException(
          `Failed to respond to comment: ${response.status}`,
        );
      }

      return response.json();
    } catch (error) {
      this.logger.error(
        `[respondToComment] Error responding to comment ${commentId} for account ${accountId}`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentsByPostId(postId: string, accountId: number) {
    try {
      const accessToken = await this.privateInfoService.getInstagramAccessToken(
        { accountId },
      );

      const response = await fetch(
        `https://graph.instagram.com/${postId}/comments?fields=id,parent_id,text,from{id,username},created_time&access_token=${accessToken}`,
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
}
