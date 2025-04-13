import { IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WebhookEntryChangeDto {
  field: string;
  value: any;
}

class WebhookEntryDto {
  @IsOptional()
  @IsArray()
  changes?: WebhookEntryChangeDto[];

  @IsOptional()
  @IsArray()
  messaging?: any[];

  id?: string;
}

export class InstagramWebhookDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WebhookEntryDto)
  entry: WebhookEntryDto[];
}