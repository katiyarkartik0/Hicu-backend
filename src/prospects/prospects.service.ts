import { Injectable } from '@nestjs/common';
import { Prospect } from './dto/create-prospect.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProspectsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(
    createProspectDto: Omit<Prospect, 'details'> & {
      details: Prisma.JsonObject;
    },
  ): Promise<Prospect> {
    return this.prismaService.prospect.create({ data: createProspectDto });
  }

  findAll(accountId: number) {
    return this.prismaService.prospect.findMany({ where: { accountId } });
  }

  async upsertPersonalDetails({
    accountId,
    userId,
    details,
    username,
  }: {
    accountId: number;
    userId: string;
    username?: string;
    details: Prisma.JsonObject;
  }) {
    const prospect = await this.prismaService.prospect.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId,
        },
      },
    });
    if (!prospect) {
      return await this.prismaService.prospect.create({
        data: {
          accountId,
          userId,
          username,
          details: details || {},
          lastLeadsGenerationAttempt: 0,
          totalLeadsGenerationAttempts: 0,
        },
      });
    } else {
      const lastDetails = prospect.details as Prisma.JsonObject;
      const updatedDetails = { ...details, ...lastDetails };
      return await this.prismaService.prospect.update({
        where: {
          accountId_userId: {
            accountId,
            userId,
          },
        },
        data: { details: updatedDetails },
      });
    }
  }

  async update({ accountId, userId, data }) {
    return await this.prismaService.prospect.update({
      where: {
        accountId_userId: {
          accountId,
          userId,
        },
      },
      data,
    });
  }

  async findByAccountIdUserId({
    userId,
    accountId,
  }: {
    userId: string;
    accountId: number;
  }): Promise<Prospect | null> {
    const prospect = await this.prismaService.prospect.findUnique({
      where: {
        accountId_userId: {
          accountId,
          userId,
        },
      },
    });

    if (!prospect) return null;

    return prospect;
  }
}
