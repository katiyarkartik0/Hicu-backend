import { StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { Injectable } from '@nestjs/common';
import type { CommentLlmGraphState, LangraphNodeCb } from './types';
import { AutomationNodeFactory } from './automationNodeFactory';
import { IgCommentAutomationService } from 'src/igCommentAutomation/igCommentAutomation.service';
import { InstagramService } from 'src/providers/instagram/instagram.service';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import {
  IgReactFlowEdge,
  IgReactFlowNode,
  IgReactFlowNodeData,
} from 'src/igCommentAutomation/types';

@Injectable()
export class GraphService {
  constructor(
    private readonly nodeHandlerRegistry: AutomationNodeFactory,
    private readonly igCommentAutomationService: IgCommentAutomationService,
    private readonly geminiService: GeminiService,
    private readonly instagramService: InstagramService,
    private readonly pineconeService: PineconeService,
  ) {}
  getGraphChannels(): StateGraphArgs<CommentLlmGraphState>['channels'] {
    return {
      conversationHistory: {
        reducer: (prev: CommentLlmGraphState['conversationHistory']) => {
          return prev;
        },
      },
      commentPayload: {
        reducer: (prev) => prev,
      },
      igAccount: {
        reducer: (prev) => {
          if (!prev || !prev.userId) {
            throw new Error('igAccount must be set and have an id');
          }
          return prev;
        },
      },
      prospect: {
        reducer: (prev) => {
          if (!prev || !prev.userId) {
            throw new Error('prospect must be set and have a userId');
          }
          return prev;
        },
      },
      leadsAsked: {
        reducer: (_, next: CommentLlmGraphState['leadsAsked']) => next,
      },
      accountId: {
        reducer: (prev: number) => prev,
      },
      services: {
        reducer: (prev: CommentLlmGraphState['services']) => prev,
      },
      igCommentAutomation: {
        reducer: (prev: CommentLlmGraphState['igCommentAutomation']) => prev,
      },
    };
  }

  private buildGraph(
    virtualNodeRegistry: Record<string, LangraphNodeCb>,
    nodes: IgReactFlowNode[],
    edges: IgReactFlowEdge[],
  ): StateGraph<CommentLlmGraphState> {
    const builder = new StateGraph<CommentLlmGraphState>({
      channels: this.getGraphChannels(),
    });

    // 1. Add all nodes first
    // 1. Add nodes
    for (const node of nodes) {
      if (
        !node.data ||
        node.data.nodeType === '__start__' ||
        node.data.nodeType === '__end__'
      ) {
        continue;
      }
      const nodeId = node.data.nodeId;
      builder.addNode(nodeId, virtualNodeRegistry[nodeId]);
    }

    // 2. Add conditional edges
    for (const node of nodes.filter(
      (n) => n.data && n.data.hasConditionalEdges,
    )) {
      if (!node.data) continue;

      const nodeKey =
        node.data.nodeType === '__start__' || node.data.nodeType === '__end__'
          ? node.data.nodeType
          : node.data.nodeId;

      builder.addConditionalEdges(
        nodeKey as any,
        // @ts-expect-error: forcing to keep silent since all the nodes in virtual registry return a Promise<CommentLlmState | void>,
        // and this expects a Promise<string | string[]>
        virtualNodeRegistry[node.data.nodeId],
      );
    }

    // 3. Add plain edges
    for (const edge of edges) {
      const source =
        edge.sourceType === '__start__' || edge.sourceType === '__end__'
          ? edge.sourceType
          : edge.sourceId;

      const target =
        edge.targetType === '__start__' || edge.targetType === '__end__'
          ? edge.targetType
          : edge.targetId;

      builder.addEdge(source as any, target as any);
    }

    return builder;
  }

  private buildVirtualNodeRegistry(
    nodes: IgReactFlowNode[],
  ): Record<string, LangraphNodeCb> {
    const registry = this.nodeHandlerRegistry.nodeRegistry;
    const virtualNodeRegistry: Record<string, LangraphNodeCb> = {};

    nodes.forEach(({ data }: IgReactFlowNode) => {
      const { nodeType, nodeId } = data as IgReactFlowNodeData;

      virtualNodeRegistry[nodeId] = registry[nodeType]({
        geminiService: this.geminiService,
        pineconeService: this.pineconeService,
        instagramService: this.instagramService,
        data,
      });
    });

    return virtualNodeRegistry;
  }

  async handleAutomation(graphState: CommentLlmGraphState) {
    console.log("first")
    const mediaId = graphState.commentPayload.media.mediaId;
    console.log("second")
console.log(graphState)
    const result =
      await this.igCommentAutomationService.findFirstByMediaId(mediaId);
      console.log("result",result)

    if (!result) return;

    const virtualNodeRegistry = this.buildVirtualNodeRegistry(result.nodes);
    const builder = this.buildGraph(
      virtualNodeRegistry,
      result.nodes,
      result.edges,
    );

    const graph = builder.compile();
    await graph.invoke(graphState);
  }
}
