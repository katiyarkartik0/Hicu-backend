import { Injectable } from '@nestjs/common';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutomationsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAutomationDto: any) {
    return this.prismaService.automation.create({ data: createAutomationDto });
  }

  findAll() {
    return this.prismaService.automation.findMany();
  }

  findOne(mediaId: string) {
    return this.prismaService.automation.findFirst({ where: { mediaId } });
  }

  findByMedia(mediaId: string) {
    return this.prismaService.automation.findFirst({ where: { mediaId } });
  }

  update(id: number, updateAutomationDto: UpdateAutomationDto) {
    return `This action updates a #${id} automation`;
  }

  remove(id: number) {
    return `This action removes a #${id} automation`;
  }
}
