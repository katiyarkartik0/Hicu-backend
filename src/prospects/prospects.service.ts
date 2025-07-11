import { Injectable } from '@nestjs/common';
import { Prospect } from './dto/create-prospect.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProspectsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createProspectDto: Prospect) {
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
    username: string;
    details: Record<string, any>;
  }) {
    // const prospect = await this.prismaService.prospect.findUnique({
    //   where: {
    //     accountId_userId: {
    //       accountId,
    //       userId,
    //     },
    //   },
    // });
    // if (!prospect) {
    //   return await this.prismaService.prospect.create({
    //     data: {
    //       accountId,
    //       userId,
    //       username,
    //       details: details || {},
    //       lastLeadsGenerationAttempt: 0,
    //       totalLeadsGenerationAttempts: 0,
    //     },
    //   });
    // } else {
    //   return await this.prismaService.prospect.update({
    //     where: {
    //       accountId_userId: {
    //         accountId,
    //         userId,
    //       },
    //     },
    //     data: { details: updatedDetails },
    //   });
    // }
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

    return {
      ...prospect,
      details: (prospect.details || {}) as Record<string, any>,
    };
  }
}
