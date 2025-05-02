import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountMemberDto } from './create-account-member.dto';

export class UpdateAccountMemberDto extends PartialType(CreateAccountMemberDto) {}
