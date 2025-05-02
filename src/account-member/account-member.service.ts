import { Injectable } from '@nestjs/common';
import { CreateAccountMemberDto } from './dto/create-account-member.dto';
import { UpdateAccountMemberDto } from './dto/update-account-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class AccountMemberService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createAccountMemberDto: CreateAccountMemberDto) {
    return await this.prisma.accountMember.create({
      data: {
        ...createAccountMemberDto,
        status: createAccountMemberDto.status || MemberStatus.INVITED,
      },
    });
  }

  findAll() {
    return `This action returns all accountMember`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountMember`;
  }

  update(id: number, updateAccountMemberDto: UpdateAccountMemberDto) {
    return `This action updates a #${id} accountMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountMember`;
  }
}
