import { Injectable } from '@nestjs/common';
import { GeminiService } from 'src/ai/providers/gemini/gemini.service';
import { DmLlmGraphState } from './types';

@Injectable()
export class AiService {
  constructor(private readonly geminiService: GeminiService) {}

  async generateFeedbackResponse(
    feedbackText: string,
    accountId: number,
  ): Promise<string> {
    const prompt = `
You are a helpful assistant. Respond to this customer feedback:

"${feedbackText}"

- If it's positive, thank them sincerely.
- If it's negative, acknowledge it politely and offer support.
- Keep the reply short and human.

Return only the message to be sent.
    `.trim();

    try {
      const result = await this.geminiService.queryGemini(prompt, accountId);
      return typeof result === 'string' ? result : '';
    } catch (error) {
      console.error('Error generating feedback response:', error);
      return 'Thank you for your feedback!';
    }
  }
  async generateLeadsExtractionText(
    details: Record<string, any>,
    requirements: string[],
    commentText: string,
    accountId: number,
  ): Promise<string> {
    console.log(details, requirements, commentText, accountId, 'here');
    const prompt = `
You're an assistant generating polite, helpful follow-up messages to collect missing information from a lead.

## Known Lead Details:
${JSON.stringify(details, null, 2)}

## Known Requirements:
${JSON.stringify(requirements, null, 2)}

## New User Message:
${JSON.stringify(commentText, null, 2)}

## Instructions:
- If information is sufficient, return an empty string.
- Otherwise, ask the user for additional helpful info (e.g., budget, goals).

Return only the message to be sent.
    `.trim();

    // console.log("[extract leads prompt]",prompt)
    return this.geminiService.queryGemini(prompt, accountId);
  }
  async makeHumanResponse(result: any, accountId: number): Promise<string> {
    const prompt = `
  You are a helpful assistant. Convert the following JSON object into a clear, friendly, and human-readable response for the user.
  
  ## JSON Input:
  ${JSON.stringify(result, null, 2)}
  
  ## Response:
  - Keep the tone professional yet approachable.
  - Highlight useful information clearly.
  - Do not include the JSON itself in the response.
  - Should be properly indented
  - summarize to important points ONLY, making the response to not more than 100 words
  `.trim();

    try {
      const geminiResponse = await this.geminiService.queryGemini(
        prompt,
        accountId,
      );

      if (typeof geminiResponse === 'string') {
        return geminiResponse.trim();
      }

      return JSON.stringify(geminiResponse);
    } catch (error) {
      console.error('Error generating human response:', error);
      return '⚠️ Failed to generate a human-readable response.';
    }
  }
  async detectIntent(state: DmLlmGraphState): Promise<string> {
    const inputText = state.dmPayload.dm.messageText;
    const accountId = state.accountId;

    const categories = [
      'feedback',
      'product_enquiry',
      'personal_details',
      'others',
    ];

    const prompt = `
You are a smart classifier. Categorize the following text into one of:
- feedback
- product_enquiry
- personal_details
- others

Return only the category as a lowercase string.

Text:
"${inputText}"
    `.trim();

    try {
      const result = await this.geminiService.queryGemini(prompt, accountId);
      console.log(result, 'intent');
      return categories.includes(result) ? result : 'others';
    } catch (error) {
      console.error('detectIntent error:', error);
      return 'others';
    }
  }

  async bringDetails({
    messageText,
    detailsRequired,
    detailsCollected,
    accountId,
  }: {
    messageText: string;
    detailsRequired: DmLlmGraphState['leadsAsked']['requirements'];
    detailsCollected: DmLlmGraphState['prospect']['details'];
    accountId: number;
  }): Promise<any> {
    const prompt = `
    You are an intelligent extraction engine.
    
    Given a user's message: "${messageText}"
    
    Your task is to extract the following details if they are present in the message: ${detailsRequired.join(', ')}.
    
    Here are the details already collected: ${JSON.stringify(detailsCollected, null, 2)}
    
    Return the response that includes:
    1. All the already collected details.
    2. Any additional details found in the message that were not already collected.
    
    Do NOT guess missing information. Only include a field if it is clearly stated or implied in the message.`;

    const responseSchema = this.buildResponseSchema(detailsRequired);
    try {
      const result = await this.geminiService.queryGeminiForObject(
        prompt,
        accountId,
        responseSchema,
      );
      return result;
    } catch (error) {
      console.error('Error generating feedback response:', error);
      return 'Thank you for your feedback!';
    }
  }

  private buildResponseSchema(detailsRequired: string[]) {
    const properties: Record<string, any> = {};
    for (const key of detailsRequired) {
      properties[key] = { type: 'string' };
    }

    return {
      type: 'object',
      properties,
      required: detailsRequired,
      additionalProperties: false,
    };
  }
}
