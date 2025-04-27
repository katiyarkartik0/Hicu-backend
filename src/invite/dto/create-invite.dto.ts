import {
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { IsCompanyEmail } from 'src/validators/isCompanyEmail';

export class CreateInviteDto {
  @IsOptional()
  @IsString()
  name?: string;

//   @IsCompanyEmail({ message: 'Email must be a valid company email' })
  inviteeEmail: string;
  inviterEmail: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Scope must contain at least one role' })
  @IsString({ each: true, message: 'Each scope must be a string' })
  scope: string[];

  @IsString()
  accountId: string;
}
