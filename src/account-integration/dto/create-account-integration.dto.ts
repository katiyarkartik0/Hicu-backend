import { IsInt, IsJSON } from 'class-validator';

export class CreateAccountIntegrationDto {
  @IsInt()
  integrationId: number;

  @IsInt()
  accountId: number;

  @IsJSON()
  config: any;
}
