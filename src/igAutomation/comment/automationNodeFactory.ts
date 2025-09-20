import { InstagramService } from 'src/providers/instagram/instagram.service';
import { PineconeService } from 'src/pinecone/pinecone.service';
import type { CommentLlmGraphState, NodeType } from './types';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { Command } from '@langchain/langgraph';

export class AutomationNodeFactory {
  constructor(
    // private readonly geminiService: GeminiService,
    // private readonly instagramService: InstagramService,
    // private readonly pineconeService: PineconeService,
  ) {}

  readonly nodeRegistry: Record<NodeType, any> = {
    __start__: () => async (state: CommentLlmGraphState) => {
      return state; // no-op
    },
    __end__: () => async (state: CommentLlmGraphState) => {
      return state; // no-op
    },

    aiRouter:
      ({
        geminiService,
        pineconeService,
        instagramService,
        conditionalEdgesToNodes,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
        conditionalEdgesToNodes: any;
      }) =>
      async (state: CommentLlmGraphState) => {
        console.log(conditionalEdgesToNodes, 'conditionalEdgesToNodes');
        const {
          comment: { commentText },
        } = state.commentPayload;
        const { accountId } = state; // currentNode = aiRouter's data

        // Get the conditional routes from the node definition
        const routes = conditionalEdgesToNodes.map(({ route }) => route);

        if (!routes.length) return undefined; // fallback

        // Build prompt dynamically
        const prompt = `
You are a smart classifier. Categorize the following text into one of the routes below:

${conditionalEdgesToNodes.map((r) => `- ${r.condition}`).join('\n')}

Return **only** the category exactly as written in lowercase.

Text:
"${commentText}"
      `.trim();
        console.log(prompt, 'prompt');
        try {
          const result = await geminiService.queryGemini(prompt, accountId);
          console.log(result, 'intent');

          // Find the matching route
          const matchedRoute = conditionalEdgesToNodes.find(
            (r) => r.condition.toLowerCase() === result?.toLowerCase(),
          )?.route;
          console.log(matchedRoute || routes[0].route);
          const matchedRouteNodeId = matchedRoute || routes[0].route;

          return new Command({
            goto: matchedRouteNodeId,
          });
        } catch (error) {
          console.error('detectIntent error:', error);
          return routes[0].route; // fallback
        }
      },

    route: () => async (state: CommentLlmGraphState) => {
      return state;
    },

    // --- DM nodes ---
    dmAiVectorDb:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        try {
          const {
            commentPayload: {
              comment: { commentText, commenterUsername, commentId },
              media: { mediaOwnerId },
            },
            accountId,
          } = state;

          const vectorSearchResult = await pineconeService.search({
            accountId,
            query: commentText,
          });

          const prompt = 'my prompt'; // replace with db query
          const localPrompt = `you have access to
        - vector search i.e., ${vectorSearchResult}
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${prompt}
        now create a result based on provided`;

          const geminiResponse = await geminiService.queryGemini(
            localPrompt,
            accountId,
          );
          const response = JSON.stringify(geminiResponse);

          await instagramService.sendDM(
            { comment: { commentId }, media: { mediaOwnerId } },
            response,
            accountId,
          );
        } catch (error) {
          console.error(`Failed to call service:`, error);
        }
      },

    dmAi:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        try {
          const {
            commentPayload: {
              comment: { commentText, commenterUsername, commentId },
              media: { mediaOwnerId },
            },
            accountId,
          } = state;

          const prompt = 'my prompt'; // replace with db query
          const localPrompt = `you have access to
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${prompt}
        now create a result based on provided`;

          const geminiResponse = await geminiService.queryGemini(
            localPrompt,
            accountId,
          );
          const response = JSON.stringify(geminiResponse);

          await instagramService.sendDM(
            { comment: { commentId }, media: { mediaOwnerId } },
            response,
            accountId,
          );
        } catch (error) {
          console.error(`Failed to call service:`, error);
        }
      },

    dmManual:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        const {
          commentPayload: {
            comment: { commentId },
            media: { mediaOwnerId },
          },
          accountId,
        } = state;

        const response = 'manual response'; // replace with db query
        await instagramService.sendDM(
          { comment: { commentId }, media: { mediaOwnerId } },
          response,
          accountId,
        );
      },

    // --- Comment nodes ---
    commentReplyAiVectorDb:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        try {
          const {
            commentPayload: {
              comment: { commentText, commenterUsername, commentId },
            },
            accountId,
          } = state;

          const vectorSearchResult = await pineconeService.search({
            accountId,
            query: commentText,
          });

          const prompt = 'my prompt'; // replace with db query
          const localPrompt = `you have access to
        - vector search i.e., ${vectorSearchResult}
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${prompt}
        now create a result based on provided`;

          const geminiResponse = await geminiService.queryGemini(
            localPrompt,
            accountId,
          );
          const response = JSON.stringify(geminiResponse);

          await instagramService.respondToComment(
            commentId,
            response,
            accountId,
          );
        } catch (error) {
          console.error(`Failed to call service:`, error);
        }
      },

    commentReplyAi:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        try {
          const {
            commentPayload: {
              comment: { commentText, commenterUsername, commentId },
            },
            accountId,
          } = state;

          const prompt = 'my prompt'; // replace with db query
          const localPrompt = `you have access to
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${prompt}
        now create a result based on provided`;

          const geminiResponse = await geminiService.queryGemini(
            localPrompt,
            accountId,
          );
          const response = JSON.stringify(geminiResponse);

          await instagramService.respondToComment(
            commentId,
            response,
            accountId,
          );
        } catch (error) {
          console.error(`Failed to call service:`, error);
        }
      },

    commentReplyManual:
      ({
        geminiService,
        pineconeService,
        instagramService,
      }: {
        geminiService: GeminiService;
        pineconeService: PineconeService;
        instagramService: InstagramService;
      }) =>
      async (state: CommentLlmGraphState) => {
        const response = 'manual response'; //replace by a db query
        console.log(state, 'state');
        const {
          commentPayload: {
            comment: { commentId },
          },
          accountId,
        } = state;

        await instagramService.respondToComment(commentId, response, accountId);
      },
  };
}
