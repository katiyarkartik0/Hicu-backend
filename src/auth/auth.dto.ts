import {
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { IsCompanyEmail } from 'src/shared/validators/isCompanyEmail';

export class UserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsCompanyEmail({ message: 'Email must be a valid company email' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class LoginDto {
  @IsCompanyEmail({ message: 'Email must be a valid company email' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class CreateInviteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsCompanyEmail({ message: 'Email must be a valid company email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Scope must contain at least one role' })
  @IsString({ each: true, message: 'Each scope must be a string' })
  scope: string[];

  @IsNumber()
  accountId: string;
}
