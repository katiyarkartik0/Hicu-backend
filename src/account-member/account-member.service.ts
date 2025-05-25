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

  async addMemberToAccount({
    accountId,
    memberId,
    status = 'INVITED',
    scope,
  }: {
    accountId: number;
    memberId: number;
    status: MemberStatus;
    scope: string[];
  }) {
    return this.prisma.accountMember.create({
      data: {
        accountId,
        memberId,
        status,
        scope,
      },
    });
  }

  async updateMemberInAccount(
    id: number,
    { status, scope }: { status?: MemberStatus; scope?: string[] },
  ) {
    return this.prisma.accountMember.update({
      where: { id },
      data: {
        status,
        scope,
      },
    });
  }

  async removeMemberFromAccount(id: number) {
    return this.prisma.accountMember.delete({
      where: { id },
    });
  }

  async listMembersOfAccount(accountId: number) {
    return this.prisma.accountMember.findMany({
      where: { accountId },
      include: { member: true },
    });
  }

  async listAccountsOfMember(memberId: number) {
    return this.prisma.account.findMany({
      where: {
        members: {
          some: {
            memberId: memberId,
          },
        },
      },
    });
  }

  async findAccountMember(id: number) {
    return this.prisma.accountMember.findUnique({
      where: { id },
      include: { member: true, account: true },
    });
  }
}
