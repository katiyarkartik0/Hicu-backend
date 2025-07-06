import { Injectable, Logger } from '@nestjs/common';
import type {
  AccountIG,
  ConversationHistory,
  Prospect,
  SanitizedCommentPayload,
} from './comments/comments.types';
import { InstagramMessage } from 'src/providers/instagram/instagram.types';
import { Type } from '@google/genai';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import type { SanitizedDmPayload } from './dms/dms.types';

@Injectable()
export class InstagramUtilsService {
  private readonly logger = new Logger(InstagramUtilsService.name);

  constructor(private readonly geminiService: GeminiService) {}
  /**
   * Extracts and formats comment + media info from raw webhook payload.
   */
  sanitizeCommentPayload(payload: any): SanitizedCommentPayload {
    try {
      const change = payload.entry[0].changes[0].value;

      const commentId = change.id;
      const commenterUsername = change.from?.username;
      const commenterId = change.from?.id;
      const commentText = change.text;
      const parentCommentId = change.parent_id ?? null;

      const mediaOwnerId = payload.entry[0].id;
      const mediaId = change.media?.id;

      if (
        !commentId ||
        !commenterUsername ||
        !mediaOwnerId ||
        !commenterId ||
        !commentText ||
        !mediaId
      ) {
        this.logger.error('Missing required fields in comment event payload');
        throw new Error('Invalid comment event payload');
      }

      return {
        comment: {
          commentId,
          commenterUsername,
          commenterId,
          commentText,
          mediaOwnerId,
          mediaId,
          parentCommentId,
          isReply: !!parentCommentId,
          timestamp: change.created_time || new Date().toISOString(),
        },
        media: { mediaOwnerId, mediaId },
      };
    } catch (err) {
      this.logger.error('Failed to sanitize comment payload', err);
      throw err;
    }
  }

  /**
   * Sanitizes Instagram conversation history into structured form.
   */
  sanitizeHistory(
    data: InstagramMessage[],
    prospectIgUserId: Prospect['userId'],
    accountIgUserId: AccountIG['userId'],
  ): ConversationHistory {
    const history: {
      prospect: ConversationHistory['prospect'];
      account: ConversationHistory['account'];
    } = {
      prospect: [],
      account: [],
    };

    for (const msg of data) {
      const senderId = msg?.from?.id;
      const content = msg?.message?.trim();

      if (!senderId || !content) continue;

      const entry = {
        message: content,
        createdTime: msg.created_time,
      };

      if (senderId === prospectIgUserId) {
        history.prospect.push(entry);
      } else if (senderId === accountIgUserId) {
        history.account.push(entry);
      } else {
        // Optional: Log unknown sender
        console.warn(`Unknown senderId ${senderId} in message ${msg.id}`);
      }
    }

    return history;
  }

  private async selectService({
    leads,
    accountId,
    history,
    services,
    commentPayload,
  }: {
    leads: any; // Replace 'any' with actual type for leads
    accountId: number;
    history: any; // Replace 'any' with actual type for history
    services: Array<any>; // Replace 'any' with actual type for services
    commentPayload: any; // Replace 'any' with actual type for commentPayload
  }): Promise<SelectServiceResponse> {
    // Directly specify the return type
    const prompt = `
    You are an AI assistant responsible for routing product enquiries to the correct Shopify service based on user messages, intent, and lead context.

    ## Available Services:
    ${services
      .map(
        (s) =>
          `- ${s.name}:\n  Description: ${s.description}\n  Required Input: ${
            s.input.length > 0 ? s.input.join(', ') : 'None'
          }`,
      )
      .join('\n\n')}

    ## Task:
    From the services listed above, choose the most appropriate one for handling this user enquiry.

    You must also evaluate which required inputs (from the service definition) are already available from:
    - Lead details at hand: ${JSON.stringify(leads.details, null, 2)}

    ## Input to Consider:
    - User Comment: "${commentPayload.comment.commentText}"
    - Conversation History: ${JSON.stringify(history, null, 2)}
    - accountId: ${accountId}

    ## Output Format (JSON):
    Return a JSON object in the following format:
    {
      "name": "selected_service_name",
      "inputsMissing": ["input_1", "input_2"],
      "inputsToBePassed": {"input_a":"value_of_input_a", "input_b":"value_of_input_b"}
    }

    If no service is relevant, return:
    {
      "name": "none",
      "inputsMissing": [],
      "inputsToBePassed": {}
    }
    `.trim();

    // Define the response schema explicitly for Gemini
    const selectServiceResponseSchema = {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description:
            'The name of the selected service or "none" if no service is relevant.',
        },
        inputsMissing: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'An array of required inputs that are missing.',
        },
        inputsToBePassed: {
          type: Type.OBJECT,
          properties: {
            accountId: {
              type: Type.NUMBER,
              description: 'account id from the state',
            },
          },
          description:
            'An object of input parameters and their values to be passed to the service.',
        },
      },
      required: ['name', 'inputsMissing', 'inputsToBePassed'],
    };

    const geminiResponse =
      await this.geminiService.queryGeminiForObject<SelectServiceResponse>(
        prompt,
        accountId,
        selectServiceResponseSchema,
      );

    console.log(
      geminiResponse,
      typeof geminiResponse,
      'gemini Response for selectService',
    );

    // No need for JSON.parse here, as queryGeminiForObject is designed to return the parsed object
    return geminiResponse;
  }

  sanitizeDmPayload(payload: any): SanitizedDmPayload {
    try {
      const value = payload?.value;

      const senderId = value?.sender?.id;
      const recipientId = value?.recipient?.id;
      const messageId = value?.message?.mid;
      const messageText = value?.message?.text;
      const timestamp = value?.timestamp;

      if (
        !senderId ||
        !recipientId ||
        !messageId ||
        !messageText ||
        !timestamp
      ) {
        this.logger.error('Missing required fields in DM payload');
        throw new Error('Invalid DM payload');
      }

      return {
        dm: {
          senderId,
          recipientId,
          messageId,
          messageText,
          timestamp,
        },
      };
    } catch (err) {
      this.logger.error('Failed to sanitize DM payload', err);
      throw err;
    }
  }
}

interface SelectServiceResponse {
  name: string;
  inputsMissing: Array<Record<string, any>>; // Or more specific type if known
  inputsToBePassed: Array<Record<string, any>>; // Or more specific type if known
}
