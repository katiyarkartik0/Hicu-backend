import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createIntegrationDto: CreateIntegrationDto) {
    return this.prisma.integration.create({ data: createIntegrationDto });
  }

  async findAll() {
    return await this.prisma.integration.findMany();
  }

  async findOne(id: number) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    return integration;
  }

  async update(id: number, updateIntegrationDto: UpdateIntegrationDto) {
    await this.findOne(id);

    return await this.prisma.integration.update({
      where: { id },
      data: {
        name: updateIntegrationDto.name,
        image: updateIntegrationDto.image,
        description: updateIntegrationDto.description,
        config: updateIntegrationDto.config as any,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.integration.delete({
      where: { id },
    });
  }
}
