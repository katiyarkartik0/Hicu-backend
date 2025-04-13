import {
  IsOptional,
  IsEnum,
} from 'class-validator';
import { InvitationStatus } from '../invitation.schema';

export class UpdateInvitationDto {
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;
}
