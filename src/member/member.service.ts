import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ name, email, password }: CreateMemberDto) {
    return this.prisma.member.create({
      data: {
        name,
        email,
        password,
      },
    });
  }

  async findAll() {
    return this.prisma.member.findMany();
  }

  async findOne(id: number) {
    return this.prisma.member.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    return this.prisma.member.update({
      where: { id },
      data: {
        name: updateMemberDto.name,
        email: updateMemberDto.email,
        password: updateMemberDto.password, // optional, depending on DTO
      },
    });
  }

  async remove(id: number) {
    return this.prisma.member.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.member.findUnique({
      where: { email },
    });
  }
}
