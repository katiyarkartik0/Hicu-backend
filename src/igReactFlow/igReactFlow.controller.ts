import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { IgReactFlowService } from './igReactFlow.service';

class CreateNodeDataDto {
  nodeId: string;
  label: string;
  description: string;
  prototypeResponse?: string;
  aiPrompt?: string;
  hasConditionalEdges: boolean;
}

// DTOs for request validation
export class CreateNodeDto {
  automationId: number;
  accountId: number;
  mediaId: string;
  nodeId: string;
  type: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  data: CreateNodeDataDto;
}

export class CreateEdgeDto {
  accountId: number;
  automationId: number;
  mediaId: string;
  edgeId: string;
  sourceId: string;
  targetId: string;
}

@Controller('igReactFlow')
export class IgReactFlowController {
  constructor(private readonly igReactFlowService: IgReactFlowService) {}

  // === NODES ===
  @Post('nodes/upsert')
  async upsertNodes(@Body() { data: nodes }: { data: CreateNodeDto[] }) {
    const data = await this.igReactFlowService.upsertNodes(nodes);
    return { data };
  }

  @Get('nodes/:automationId')
  async getNodes(@Param('automationId', ParseIntPipe) automationId: number) {
    const data = await this.igReactFlowService.getNodes({ automationId });
    return { data };
  }

  @Delete('nodes/:nodeId')
  async deleteNode(@Param('nodeId') nodeId: string) {
    const data = await this.igReactFlowService.deleteNode(nodeId);
    return { data };
  }

  // === EDGES ===
  @Post('edges/upsert')
  async upsertEdges(@Body() { data: edges }: { data: CreateEdgeDto[] }) {
    const data = await this.igReactFlowService.upsertEdges(edges);
    return { data };
  }

  @Get('edges/:automationId')
  async getEdges(@Param('automationId', ParseIntPipe) automationId: number) {
    const data = await this.igReactFlowService.getEdges({ automationId });
    return { data };
  }

  @Delete('edges/:edgeId')
  async deleteEdge(@Param('edgeId') edgeId: string) {
    const data = await this.igReactFlowService.deleteEdge(edgeId);
    return { data };
  }
}
