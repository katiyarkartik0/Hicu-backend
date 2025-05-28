import { IsInt, IsObject } from 'class-validator';

export class CreateAccountIntegrationDto {
  @IsInt()
  integrationId: number;

  @IsInt()
  accountId: number;

  @IsObject()
  config: object;
}
