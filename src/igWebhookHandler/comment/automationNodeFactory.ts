import { Command } from '@langchain/langgraph';
import type { IgReactFlowNodeType } from 'src/igCommentAutomation/types';
import type { CommentLlmGraphState, LangraphNodeCb, NodeDeps } from './types';

export class AutomationNodeFactory {
  constructor() {} // private readonly pineconeService: PineconeService, // private readonly instagramService: InstagramService, // private readonly geminiService: GeminiService,

  readonly nodeRegistry: Record<
    IgReactFlowNodeType,
    ({
      pineconeService,
      instagramService,
      geminiService,
      data,
    }: NodeDeps) => LangraphNodeCb
  > = {
    __start__: () => async (state: CommentLlmGraphState) => {
      return state; // no-op
    },
    __end__: () => async (state: CommentLlmGraphState) => {
      return state; // no-op
    },

    aiRouter:
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
      async (state: CommentLlmGraphState) => {
        const { conditionalEdgesToNodes } = data;
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
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
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

          const { aiPrompt } = data;
          if (!aiPrompt) {
            return console.log('ai prompt not available');
          }
          const localPrompt = `
          You are an Instagram DM assistant.
          
          The commenter asked: "${commentText}"
          Commenter username: ${commenterUsername}
          
          Relevant knowledge from vector search:
          ${JSON.stringify(vectorSearchResult)}
          
          Instruction for you (the AI):
          ${aiPrompt}
          
          Now, based on the above, write a helpful and conversational reply to the commenter. 
          Do not mention vector search or prompts — just answer naturally as if you are the brand. 
          `;

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
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
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
          const { aiPrompt } = data;
          if (!aiPrompt) {
            return console.log('no ai prompt');
          }
          const localPrompt = `you have access to
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${aiPrompt}
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
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
      async (state: CommentLlmGraphState) => {
        const {
          commentPayload: {
            comment: { commentId },
            media: { mediaOwnerId },
          },
          accountId,
        } = state;

        const { prototypeResponse } = data;
        if (!prototypeResponse) {
          return console.log('no prototype response');
        }
        await instagramService.sendDM(
          { comment: { commentId }, media: { mediaOwnerId } },
          prototypeResponse,
          accountId,
        );
      },

    // --- Comment nodes ---
    commentReplyAiVectorDb:
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
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

          const { aiPrompt } = data;
          if (!aiPrompt) {
            return console.log('no ai prompt');
          }
          const localPrompt = `you have access to
        - vector search i.e., ${vectorSearchResult}
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${aiPrompt}
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
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
      async (state: CommentLlmGraphState) => {
        try {
          const {
            commentPayload: {
              comment: { commentText, commenterUsername, commentId },
            },
            accountId,
          } = state;

          const { aiPrompt } = data;
          if (!aiPrompt) {
            return console.log('no ai prompt');
          }

          const localPrompt = `you have access to
        - comment text i.e., ${commentText}
        - commenter username i.e., ${commenterUsername}
        - prompt i.e., ${aiPrompt}
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
      ({ geminiService, pineconeService, instagramService, data }: NodeDeps) =>
      async (state: CommentLlmGraphState) => {
        const { prototypeResponse } = data;
        if (!prototypeResponse) {
          return console.log('no response to send');
        }
        console.log(state, 'state');
        const {
          commentPayload: {
            comment: { commentId },
          },
          accountId,
        } = state;

        await instagramService.respondToComment(
          commentId,
          prototypeResponse,
          accountId,
        );
      },
  };
}
