import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Leads as LeadsAsked } from './dto/create-lead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createLeadDto: LeadsAsked) {
    return await this.prismaService.leads.create({ data: createLeadDto });
  }

  async findAll(): Promise<LeadsAsked[]> {
    return await this.prismaService.leads.findMany();
  }

  async findOne(id: number): Promise<LeadsAsked> {
    const lead = await this.prismaService.leads.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with id ${id} not found`);
    return lead;
  }

  async update(id: number, updateLeadDto: Partial<LeadsAsked>) {
    const existing = await this.prismaService.leads.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Lead with id ${id} not found`);

    return await this.prismaService.leads.update({
      where: { id },
      data: updateLeadDto,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const lead = await this.prismaService.leads.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead with id ${id} not found`);

    await this.prismaService.leads.delete({ where: { id } });

    return { message: `Lead with id ${id} removed successfully` };
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
