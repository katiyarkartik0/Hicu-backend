import { Injectable } from '@nestjs/common';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type {
  IgCommentAutomation,
  IgDmAutomation,
} from './automations.types';

@Injectable()
export class AutomationsService {
  constructor(private readonly prismaService: PrismaService) {}

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
