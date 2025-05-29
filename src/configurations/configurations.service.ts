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
    console.log(res);
    return res;
  }

  async create(createConfigurationsDto: CreateConfigurationsDto) {
    const { config } = createConfigurationsDto;
    console.log(createConfigurationsDto,"createConfigurationsDto")

    const encryptedConfiguration = await this.encryptConfigurations(config);
    // console.log(encryptedConfiguration,"encryptedConfiguration")
    return this.prismaService.configurations.create({
      data: { ...createConfigurationsDto, config: encryptedConfiguration },
    });
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
    console.log(accountId)
    const integrations =
      (await this.prismaService.configurations.findMany({
        where: {
          accountId: accountId,
        },
      })) || [];
    console.log(integrations, 'integrations');
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
