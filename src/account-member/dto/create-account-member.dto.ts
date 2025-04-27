import { MemberStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAccountMemberDto {
  @IsString()
  accountId: string;

  @IsString()
  memberId: string;

  @IsArray()
  scope: string[];

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;
}
