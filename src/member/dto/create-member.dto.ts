import { MinLength, IsOptional } from 'class-validator';
import { IsCompanyEmail } from 'src/shared/validators/isCompanyEmail';

export class CreateMemberDto {
  @IsOptional()
  name?: string;

  @IsCompanyEmail({ message: 'Email must be a valid company email' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
