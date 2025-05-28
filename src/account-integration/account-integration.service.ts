import { Injectable } from '@nestjs/common';
import { CreateAccountIntegrationDto } from './dto/create-account-integration.dto';
import { UpdateAccountIntegrationDto } from './dto/update-account-integration.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class AccountIntegrationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}
  private async encryptConfigurations(config: object) {
    let res = {};
    Object.keys(config).map((name) => {
      res = { ...res, [name]: this.encryptionService.encrypt(config[name]) };
    });
    console.log(res);
    return res;
  }

  async create(createAccountIntegrationDto: CreateAccountIntegrationDto) {
    const { config } = createAccountIntegrationDto;
    const encryptedConfiguration = await this.encryptConfigurations(config);
    return this.prismaService.accountIntegration.create({
      data: { ...createAccountIntegrationDto, config: encryptedConfiguration },
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
    let integration;
    if (integrationId) {
      integration =
        (await this.prismaService.accountIntegration.findFirst({
          where: {
            integrationId: integrationId,
            accountId: accountId,
          },
          select: {
            id: true,
            config: true,
          },
        })) || {};
    } else if (integrationName) {
      integration =
        (await this.prismaService.accountIntegration.findFirst({
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
        })) || {};
    }

    let decryptedConfig = {};
    Object.keys(integration.config).forEach((name) => {
      decryptedConfig = {
        ...decryptedConfig,
        [name]: this.encryptionService.decrypt(integration.config[name]),
      };
    });
    console.log(decryptedConfig, 'decryptedConfig');

    return decryptedConfig;
  }

  update(id: number, updateAccountIntegrationDto: UpdateAccountIntegrationDto) {
    return `This action updates a #${id} accountIntegration`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountIntegration`;
  }
}
