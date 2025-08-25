import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { accountDetailsHelper } from '../helper';
import { IgUserProfile } from '../instagram.types';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class PrivateInfoService {
  private readonly logger = new Logger(PrivateInfoService.name);

  constructor(
    private readonly configurationsService: ConfigurationsService,
    private readonly accountService: AccountService,
  ) {}

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
  }): Promise<IgUserProfile> {
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

      const userProfile: IgUserProfile =
        accountDetailsHelper.transformToUserProfile(result);
      return userProfile;
    } catch (error) {
      this.logger.error(
        'Error fetching my details',
        error.stack || error.message,
      );

      throw new InternalServerErrorException(error.message);
    }
  }

  async syncProfile(accountId: number) {
    try {
      console.log(accountId,"[syncProfile]: privateInfo.service.ts")
      const userProfile = await this.getMyDetails({ accountId });

      await this.accountService.updateAccount(accountId, userProfile);

      return userProfile;
    } catch (error) {
      console.error('Failed to sync Instagram profile:', error);
      throw error; // propagate the error
    }
  }
}
