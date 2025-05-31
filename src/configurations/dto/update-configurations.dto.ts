import { IsInt, IsObject } from 'class-validator';

export class UpdateConfigurationsDto {
  @IsInt()
  id: number;

  @IsInt()
  integrationId?: number;

  @IsInt()
  accountId?: number;

  @IsObject()
  config?: Record<string, any>; }
