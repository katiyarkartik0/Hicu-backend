import { Injectable } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LeadsAsked } from 'src/automations/automations.types';

@Injectable()
export class LeadsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createLeadDto: CreateLeadDto) {
    return 'This action adds a new lead';
  }

  findAll() {
    return `This action returns all leads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lead`;
  }

  update(id: number, updateLeadDto: UpdateLeadDto) {
    return `This action updates a #${id} lead`;
  }

  remove(id: number) {
    return `This action removes a #${id} lead`;
  }

  async findByAccount(accountId: number): Promise<LeadsAsked | null> {
    const lead = await this.prismaService.leads.findUnique({
      where: { accountId },
    });

    if (!lead) return null;

    const requirements = Array.isArray(lead.requirements)
      ? lead.requirements
      : [];

    return {
      ...lead,
      requirements: requirements as string[],
    };
  }
}
