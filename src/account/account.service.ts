import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount({
    accountName: name,
    providerAccessToken,
  }: CreateAccountDto) {
    return await this.prisma.account.create({
      data: {
        name,
        providerAccessToken,
      },
    });
  }

  async findAllAccounts() {
    return await this.prisma.account.findMany();
  }

  async findAccountById(id: string) {
    return await this.prisma.account.findUnique({
      where: { id },
    });
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto) {
    const { accountName: name, providerAccessToken } = updateAccountDto;

    return await this.prisma.account.update({
      where: { id },
      data: {
        name,
        providerAccessToken,
      },
    });
  }

  async removeAccount(id: string) {
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
    accountId: string;
    memberId: string;
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
    id: string,
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

  async removeMemberFromAccount(id: string) {
    return this.prisma.accountMember.delete({
      where: { id },
    });
  }

  async listMembersOfAccount(accountId: string) {
    return this.prisma.accountMember.findMany({
      where: { accountId },
      include: { member: true },
    });
  }

  async listAccountsOfMember(memberId: string) {
    return this.prisma.accountMember.findMany({
      where: { memberId },
      include: { account: true },
    });
  }

  async findAccountMember(id: string) {
    return this.prisma.accountMember.findUnique({
      where: { id },
      include: { member: true, account: true },
    });
  }
}
