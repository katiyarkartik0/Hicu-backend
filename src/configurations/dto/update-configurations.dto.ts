import { PartialType } from '@nestjs/mapped-types';
import { CreateConfigurationsDto } from './create-configurations.dto';

export class UpdateConfigurationsDto extends PartialType(CreateConfigurationsDto) {}
