import { IsInt, IsObject } from 'class-validator';

export class CreateConfigurationsDto {
  @IsInt()
  integrationId: number;

  @IsInt()
  accountId: number;

  @IsObject()
  config: object;
}
