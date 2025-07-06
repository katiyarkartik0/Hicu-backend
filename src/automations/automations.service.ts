import { Injectable } from '@nestjs/common';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type {
  Automation,
  IgCommentAutomation,
  IgDmAutomation,
} from './automations.types';

@Injectable()
export class AutomationsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createAutomationDto: Omit<Automation, 'id'>) {
    return this.prismaService.automation.create({ data: createAutomationDto });
  }

  findAll({ accountId }: { accountId: number }) {
    return this.prismaService.automation.findMany({ where: { accountId } });
  }

  findOne(id: number) {
    return this.prismaService.automation.findFirst({ where: { id } });
  }

  findByMedia(mediaId: string) {
    return this.prismaService.automation.findUnique({ where: { mediaId } });
  }

  update(id: number, updateAutomationDto: UpdateAutomationDto) {
    return `This action updates a #${id} automation`;
  }

  async remove(id: number) {
    // await this.prismaService.userProgress.deleteMany({
    //   where: { automationId: id },
    // });
    // return this.prismaService.automation.delete({ where: { id } });
  }

  createIgCommentAutomation(data: Omit<IgCommentAutomation, 'id'>) {
    return this.prismaService.igCommentAutomation.create({ data });
  }

  findAllIgCommentAutomation({ accountId }: { accountId: number }) {
    return this.prismaService.igCommentAutomation.findMany({
      where: { accountId },
    });
  }

  findByIgCommentAutomationByMedia(mediaId: string) {
    return this.prismaService.igCommentAutomation.findUnique({ where: { mediaId } });
  }

  createIgDmAutomation(data: Omit<IgDmAutomation, 'id'>) {
    return this.prismaService.igDmAutomation.create({ data });
  }
}
