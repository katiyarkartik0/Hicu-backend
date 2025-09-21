import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNodeDto, CreateEdgeDto } from './igReactFlow.controller';
import { Prisma } from '@prisma/client';

@Injectable()
export class IgReactFlowService {
  constructor(private readonly prismaService: PrismaService) {}

  async getNodes({ automationId }: { automationId: number }) {
    return this.prismaService.igReactFlowNode.findMany({
      where: { automationId },
      include: {
        data: true,
      },
    });
  }

  async getEdges({ automationId }: { automationId: number }) {
    return this.prismaService.igReactFlowEdge.findMany({
      where: { automationId },
    });
  }

  async upsertNodes(nodes: CreateNodeDto[]) {
    console.log(nodes);
    // return;
    return this.prismaService.$transaction(
      nodes.map((node) =>
        this.prismaService.igReactFlowNode.upsert({
          where: { nodeId: node.nodeId },
          update: this.mapNodeUpdate(node),
          create: this.mapNodeCreate(node),
        }),
      ),
    );
  }

  async deleteNode(nodeId: string) {
    return this.prismaService.$transaction([
      this.prismaService.igReactFlowNodeData.deleteMany({ where: { nodeId } }),
      this.prismaService.igReactFlowEdge.deleteMany({
        where: { OR: [{ sourceId: nodeId }, { targetId: nodeId }] },
      }),
      this.prismaService.igReactFlowNode.deleteMany({ where: { nodeId } }), // safer
    ]);
  }

  async deleteEdge(edgeId: string) {
    return this.prismaService.igReactFlowEdge.deleteMany({
      where: { edgeId },
    });
  }

  async upsertEdges(edges: CreateEdgeDto[]) {
    return this.prismaService.$transaction(
      edges.map((edge) =>
        this.prismaService.igReactFlowEdge.upsert({
          where: { edgeId: edge.edgeId },
          update: {
            sourceId: edge.sourceId,
            targetId: edge.targetId,
            sourceType: edge.sourceType,
            targetType: edge.targetType,
            mediaId: edge.mediaId,
            automationId: edge.automationId,
          },
          create: {
            automation: { connect: { id: edge.automationId } },
            edgeId: edge.edgeId,
            account: { connect: { id: edge.accountId } },
            source: { connect: { nodeId: edge.sourceId } },
            target: { connect: { nodeId: edge.targetId } },
            igMedia: { connect: { id: edge.mediaId } },
            sourceType: edge.sourceType,
            targetType: edge.targetType,
          },
        }),
      ),
    );
  }

  private mapNodeCreate(
    node: CreateNodeDto,
  ): Prisma.IgReactFlowNodeCreateInput {
    return {
      automation: { connect: { id: node.automationId } },
      nodeId: node.nodeId,
      type: node.type,
      positionX: node.positionX,
      positionY: node.positionY,
      width: node.width,
      height: node.height,
      account: {
        connect: { id: node.accountId },
      },
      igMedia: {
        connect: { id: node.mediaId },
      },
      extent: node.extent,
      parentId: node.parentId,
      data: node.data
        ? {
            create: {
              label: node.data.label,
              description: node.data.description,
              prototypeResponse: node.data.prototypeResponse || null,
              aiPrompt: node.data.aiPrompt || null,
              hasConditionalEdges: node.data.hasConditionalEdges,
              account: { connect: { id: node.accountId } },
              igMedia: {
                connect: { id: node.mediaId },
              },
              nodeType: node.type,
              automationId: node.automationId,
              conditionalEdgesToNodes: node.data.conditionalEdgesToNodes,
            },
          }
        : undefined,
    };
  }

  private mapNodeUpdate(
    node: CreateNodeDto,
  ): Prisma.IgReactFlowNodeUpdateInput {
    return {
      type: node.type,
      positionX: node.positionX,
      positionY: node.positionY,
      width: node.width,
      height: node.height,

      account: {
        connect: { id: node.accountId },
      },
      igMedia: {
        connect: { id: node.mediaId },
      },

      extent: node.extent,
      parentId: node.parentId,

      data: node.data
        ? {
            upsert: {
              create: {
                label: node.data.label,
                description: node.data.description,
                prototypeResponse: node.data.prototypeResponse || null,
                aiPrompt: node.data.aiPrompt || null,
                hasConditionalEdges: node.data.hasConditionalEdges,
                account: { connect: { id: node.accountId } },
                igMedia: { connect: { id: node.mediaId } },
                nodeType: node.type,
                automationId: node.automationId,
                conditionalEdgesToNodes: node.data.conditionalEdgesToNodes,
              },
              update: {
                // ✅ Nested scalar updates still need { set: … }
                label: { set: node.data.label },
                description: { set: node.data.description },
                prototypeResponse: node.data.prototypeResponse
                  ? { set: node.data.prototypeResponse }
                  : { set: null },
                aiPrompt: node.data.aiPrompt
                  ? { set: node.data.aiPrompt }
                  : { set: null },
                hasConditionalEdges: { set: node.data.hasConditionalEdges },
                nodeType: { set: node.type },
                account: { connect: { id: node.accountId } },
                igMedia: { connect: { id: node.mediaId } },
                automationId: { set: node.automationId },
                conditionalEdgesToNodes: node.data.conditionalEdgesToNodes,
              },
            },
          }
        : undefined,
    };
  }

  async getNodeData({ nodeId }: { nodeId: string }) {
    return this.prismaService.igReactFlowNodeData.findMany({
      where: { nodeId },
    });
  }

  async getAllNodeData({ automationId }: { automationId: number }) {
    return this.prismaService.igReactFlowNodeData.findMany({
      where: { automationId },
    });
  }
}
