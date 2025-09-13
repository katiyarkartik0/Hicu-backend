import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IgCommentAutomationService {
  constructor(private readonly prismaService: PrismaService) {}
  async createAutomation(dto: {
    name?: string;
    mediaId: string;
    accountId: number;
    commentAutomationId?: number;
  }) {
    return this.prismaService.igCommentAutomation.create({
      data: {
        name: dto.name,
        mediaId: dto.mediaId,
        accountId: dto.accountId,
        commentAutomationId: dto.commentAutomationId ?? 0,
      },
    });
  }

  async findAllByMediaId(mediaId: string) {
    return this.prismaService.igCommentAutomation.findMany({
      where: { mediaId },
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

}
