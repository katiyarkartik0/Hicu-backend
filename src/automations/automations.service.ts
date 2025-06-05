import { Injectable } from '@nestjs/common';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AutomationsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAutomationDto: CreateAutomationDto) {
    return this.prismaService.automation.create({ data: createAutomationDto });
  }

  findAll({ accountId }: { accountId: number }) {
    return this.prismaService.automation.findMany({ where: { accountId } });
  }

  findOne(id: number) {
    return this.prismaService.automation.findFirst({ where: { id } });
  }

  findByMedia(mediaId: string) {
    return this.prismaService.automation.findFirst({ where: { mediaId } });
  }

  update(id: number, updateAutomationDto: UpdateAutomationDto) {
    return `This action updates a #${id} automation`;
  }

  async remove(id: number) {
    await this.prismaService.userProgress.deleteMany({
      where: { automationId: id },
    });
    return this.prismaService.automation.delete({ where: { id } });
  }
}
