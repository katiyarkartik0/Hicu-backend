import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly AI: any;

  constructor(private readonly configService: ConfigService) {
    const { geminiApiKey } = this.configService.getOrThrow<any>('gemini');
    this.AI = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  /**
   * Generates a prompt for classifying a customer interaction
   * into one or more predefined categories.
   *
   * @param interaction The customer message to classify.
   * @param interactionClasses The list of classification categories.
   * Categories should be provided in the format:
   * ```typescript
   * [
   *   'PRODUCT_INQUIRY:PRODUCT_AVAILABILITY',
   *   'ORDER_MANAGEMENT:ORDER_STATUS',
   *   'RETURNS_AND_REFUNDS:RETURN_REQUESTS',
   *   'SHIPPING_AND_DELIVERY:SHIPPING_OPTIONS',
   *   'FEEDBACK_AND_REVIEWS:PRODUCT_FEEDBACK',
   *   'GENERAL_INQUIRIES:BUSINESS_HOURS',
   *   'COMPLAINTS_AND_ISSUES:PRODUCT_DEFECTS',
   *   'COLLABORATION_AND_PARTNERSHIP_REQUESTS:INFLUENCER_COLLABORATIONS',
   *   'EVENT_AND_WEBINAR_QUERIES:EVENT_DETAILS',
   *   'PAYMENT_AND_BILLING:PAYMENT_FAILURES',
   *   'PRODUCT_CUSTOMIZATION_REQUESTS:CUSTOM_ORDERS',
   *   'OUT_OF_SCOPE_OR_IRRELEVANT_MESSAGES:SPAM',
   * ];
   * ```
   * @returns A formatted prompt string.
   */
  private generateInteractionClassificationPrompt(
    interaction: string,
    interactionClasses: Array<string>,
  ): string {
    const prompt = `
    You are a smart classification engine.
    
    Classify the following customer message into one or more categories from the list below.
    - Choose only from the provided list.
    - Return ALL the categories and subcategories that match the interaction to any degree, ordered by relevance. 
    - If multiple categories match, include them in the response, ensuring the most relevant ones come first.
    
    Categories:
    ${interactionClasses.map((c) => `- ${c}`).join('\n')}
    
    Customer message: "${interaction}"
    
    Return:
    `;
    return prompt.trim();
  }

  /**
   * Classifies a given customer interaction using the Gemini AI API.
   *
   * @param params.interaction The customer message to classify.
   * @param interactionClasses The list of classification categories.
   * Categories should be provided in the format:
   * ```typescript
   * [
   *   'PRODUCT_INQUIRY:PRODUCT_AVAILABILITY',
   *   'ORDER_MANAGEMENT:ORDER_STATUS',
   *   'RETURNS_AND_REFUNDS:RETURN_REQUESTS',
   *   'SHIPPING_AND_DELIVERY:SHIPPING_OPTIONS',
   *   'FEEDBACK_AND_REVIEWS:PRODUCT_FEEDBACK',
   *   'GENERAL_INQUIRIES:BUSINESS_HOURS',
   *   'COMPLAINTS_AND_ISSUES:PRODUCT_DEFECTS',
   *   'COLLABORATION_AND_PARTNERSHIP_REQUESTS:INFLUENCER_COLLABORATIONS',
   *   'EVENT_AND_WEBINAR_QUERIES:EVENT_DETAILS',
   *   'PAYMENT_AND_BILLING:PAYMENT_FAILURES',
   *   'PRODUCT_CUSTOMIZATION_REQUESTS:CUSTOM_ORDERS',
   *   'OUT_OF_SCOPE_OR_IRRELEVANT_MESSAGES:SPAM',
   * ];
   * ```
   * @returns The AI's classification response.
   * @throws InternalServerErrorException If classification fails.
   */
  async classifyInteraction({
    interaction,
    interactionClasses,
  }: {
    interaction: string;
    interactionClasses: Array<string>;
  }): Promise<any> {
    try {
      const prompt = this.generateInteractionClassificationPrompt(
        interaction,
        interactionClasses,
      );

      const aiResponse = await this.askGemini(prompt);

      return aiResponse;
    } catch (error) {
      this.logger.error('Error classifying interaction', error);
      throw new InternalServerErrorException('Failed to classify interaction');
    }
  }

  /**
   * Sends a prompt to the Gemini AI API and retrieves the AI's response.
   *
   * @param prompt The input prompt string to send to the API.
   * @returns The parsed response from the Gemini API.
   * @throws InternalServerErrorException If the API call fails.
   */
  private async askGemini(prompt: string): Promise<any> {
    try {
      const response = await this.AI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,

        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: 'Name of the classes',
              nullable: false,
            },
          },
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new InternalServerErrorException(
        'Error communicating with Gemini API',
      );
    }
  }

  async queryGemini(prompt: string): Promise<any> {
    try {
      const response = await this.AI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.STRING,
            description: 'Response',
            nullable: false,
          },
        },
      });
      return JSON.parse(response.text);
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new InternalServerErrorException(
        'Error communicating with Gemini API',
      );
    }
  }
}
