import { Injectable } from '@nestjs/common';
import { Prospect } from './dto/create-prospect.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProspectsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createProspectDto: Prospect) {
    return this.prismaService.prospect.create({ data: createProspectDto });
  }

  findAll() {
    return `This action returns all prospects`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prospect`;
  }

  update(id: number, updateProspectDto) {
    return `This action updates a #${id} prospect`;
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
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
