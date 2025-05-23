import { MemberStatus } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateAccountMemberDto {
  @IsNumber()
  accountId: number;

  @IsNumber()
  memberId: number;

  @IsArray()
  scope: string[];

  @IsEnum(MemberStatus)
  @IsOptional()
  status?: MemberStatus;
}
