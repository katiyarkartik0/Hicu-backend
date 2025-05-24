import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MemberStatus } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(createAccountDto: CreateAccountDto) {
    return await this.prisma.account.create({
      data: createAccountDto,
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
    return await this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
    });
  }

  async removeAccount(id: number) {
    return await this.prisma.account.delete({
      where: { id },
    });
  }
}
