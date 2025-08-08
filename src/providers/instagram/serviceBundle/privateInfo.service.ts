import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { accountDetailsHelper } from '../helper';
import { UserProfile } from '../instagram.types';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';

@Injectable()
export class PrivateInfoService {
  private readonly logger = new Logger(PrivateInfoService.name);

  constructor(private readonly configurationsService: ConfigurationsService) {}

  async getInstagramAccessToken({ accountId }: { accountId: number }) {
    try {
      const { config: configurations } =
        await this.configurationsService.getConfigurationForAccount({
          integrationName: 'instagram',
          accountId,
        });
      const accessToken =
        configurations[CONFIGURATIONS_VARIABLES.INSTAGRAM.ACCESS_TOKEN];
      return accessToken;
    } catch (error) {
      this.logger.error(
        'Error getting instagram access token',
        error.stack || error.message,
      );
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyDetails({
    accountId,
  }: {
    accountId: number;
  }): Promise<UserProfile> {
    try {
      const accessToken = await this.getInstagramAccessToken({ accountId });
      const params = new URLSearchParams({
        fields: accountDetailsHelper.instagramFields,
        access_token: accessToken,
      });

      const url = `https://graph.instagram.com/me?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new InternalServerErrorException(
          `Instagram API error for account ${accountId}: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      return accountDetailsHelper.transformToUserProfile(result);
    } catch (error) {
      this.logger.error(
        'Error fetching my details',
        error.stack || error.message,
      );

      throw new InternalServerErrorException(error.message);
    }
  }
}
