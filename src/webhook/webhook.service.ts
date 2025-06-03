import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';

@Injectable()
export class WebhookService {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  private async getInstagramWebhookSecret({
    accountId,
  }: {
    accountId: number;
  }) {
    const { config: configurations } =
      await this.configurationsService.getConfigurationForAccount({
        integrationName: 'instagram',
        accountId,
      });
    const webhookSecret =
      configurations[CONFIGURATIONS_VARIABLES.INSTAGRAM.WEBHOOK_SECRET];
    return webhookSecret;
  }

  async verifyWebhook(token: string, accountId: number) {
    const webhookSecret = await this.getInstagramWebhookSecret({ accountId });
    return token === webhookSecret;
  }
}
