import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountIntegrationDto } from './create-account-integration.dto';

export class UpdateAccountIntegrationDto extends PartialType(CreateAccountIntegrationDto) {}
