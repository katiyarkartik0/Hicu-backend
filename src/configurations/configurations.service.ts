import { Injectable } from '@nestjs/common';
import { CreateConfigurationsDto } from './dto/create-configurations.dto';
import { UpdateConfigurationsDto } from './dto/update-configurations.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class ConfigurationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}
  private async encryptConfigurations(config: object) {
    let res = {};
    Object.keys(config).map((name) => {
      res = { ...res, [name]: this.encryptionService.encrypt(config[name]) };
    });
    return res;
  }

  async create(createConfigurationsDto: CreateConfigurationsDto) {
    const { config } = createConfigurationsDto;

    const encryptedConfiguration = await this.encryptConfigurations(config);
    return this.prismaService.configurations.create({
      data: { ...createConfigurationsDto, config: encryptedConfiguration },
    });
  }

  async upsert(dto: CreateConfigurationsDto | UpdateConfigurationsDto) {
    const { config } = dto;
    const encryptedConfig = config
      ? await this.encryptConfigurations(config)
      : {};

    if ('id' in dto) {
      // Update
      return this.prismaService.configurations.update({
        where: { id: dto.id },
        data: { ...dto, config: encryptedConfig },
      });
    } else {
      // Create
      return this.prismaService.configurations.create({
        data: {
          integrationId: dto.integrationId,
          accountId: dto.accountId,
          config: encryptedConfig,
        },
      });
    }
  }

  async getConfigurationForAccount({
    integrationId,
    accountId,
    integrationName,
  }: {
    integrationId: number;
    accountId: number;
    integrationName?: string;
  }) {
    let integration;
    if (integrationId && accountId) {
      integration =
        (await this.prismaService.configurations.findFirst({
          where: {
            integrationId: integrationId,
            accountId: accountId,
          },
        })) || {};
    } else if (integrationName && accountId) {
      integration =
        (await this.prismaService.configurations.findFirst({
          where: {
            accountId: accountId,
            integration: {
              name: integrationName,
            },
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
    return { ...integration, config: decryptedConfig };
  }

  async getConfigurationsForAccount({ accountId }: { accountId: number }) {
    const integrations =
      (await this.prismaService.configurations.findMany({
        where: {
          accountId: accountId,
        },
      })) || [];
    const res = integrations.map((integration) => {
      const config =
        integration.config && typeof integration.config === 'object'
          ? Object.entries(integration.config).reduce(
              (acc, [key, value]) => {
                acc[key] = this.encryptionService.decrypt(String(value));
                return acc;
              },
              {} as Record<string, string>,
            )
          : {};

      return { ...integration, config };
    });
    console.log(res);
    return res;
  }
}
