import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(createAccountDto: CreateAccountDto) {
    const accountData = {
      ...createAccountDto,
      name: createAccountDto.accountName,
    };
    return await this.prisma.account.create({
      data: accountData,
    });
  }

  async findAllAccounts() {
    return await this.prisma.account.findMany();
  }

  async findAccountById(id: number) {
    return await this.prisma.account.findUnique({
      where: { id },
    });
  }

  async updateAccount(id: number, updateAccountDto: UpdateAccountDto) {
    const accountData = {
      ...updateAccountDto,
      name: updateAccountDto.accountName,
    };
    return await this.prisma.account.update({
      where: { id },
      data: accountData,
    });
  }

  async removeAccount(id: number) {
    return await this.prisma.account.delete({
      where: { id },
    });
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
    return this.prisma.accountMember.findMany({
      where: { memberId },
      include: { account: true },
    });
  }

  async findAccountMember(id: number) {
    return this.prisma.accountMember.findUnique({
      where: { id },
      include: { member: true, account: true },
    });
  }
}
