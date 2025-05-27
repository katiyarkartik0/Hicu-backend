import { Injectable } from '@nestjs/common';
import { CreateAccountIntegrationDto } from './dto/create-account-integration.dto';
import { UpdateAccountIntegrationDto } from './dto/update-account-integration.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountIntegrationService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAccountIntegrationDto: CreateAccountIntegrationDto) {
    return this.prismaService.accountIntegration.create({
      data: createAccountIntegrationDto,
    });
  }

  findAll() {
    return `This action returns all accountIntegration`;
  }

  async findOne(id: number) {}

  async getAccountConfiguration({
    integrationId,
    accountId,
    integrationName,
  }: {
    integrationId: number;
    accountId: number;
    integrationName?: string;
  }) {
    let config;
    if (integrationId) {
      config = await this.prismaService.accountIntegration.findFirst({
        where: {
          integrationId: integrationId,
          accountId: accountId,
        },
        select: {
          id: true,
          config: true,
        },
      });
    } else if (integrationName) {
      config = await this.prismaService.accountIntegration.findFirst({
        where: {
          accountId: accountId,
          integration: {
            name: integrationName,
          },
        },
        select: {
          id: true,
          config: true,
        },
      });
    }

    return config;
  }

  update(id: number, updateAccountIntegrationDto: UpdateAccountIntegrationDto) {
    return `This action updates a #${id} accountIntegration`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountIntegration`;
  }
}
