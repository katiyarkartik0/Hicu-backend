import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';
import { ConfigurationsService } from 'src/configurations/configurations.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly AI: any;

  constructor(private readonly configurationsService: ConfigurationsService) {}

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

  private async getGeminiApiKey({
    accountId,
  }: {
    accountId: number;
  }): Promise<string> {
    const { config: configurations } =
      await this.configurationsService.getConfigurationForAccount({
        integrationName: 'Gemini',
        accountId,
      });
    const geminiApiKey =
      configurations[CONFIGURATIONS_VARIABLES.GEMINI.ACCESS_TOKEN];
    return geminiApiKey;
  }

  async queryGemini(prompt: string, accountId: number): Promise<any> {
    try {
      const geminiApiKey = await this.getGeminiApiKey({ accountId });
      if (!geminiApiKey) {
        return;
      }
      const AI = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await AI.models.generateContent({
        model: 'gemini-2.5-flash',
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
      return response.text && JSON.parse(response.text);
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new InternalServerErrorException(
        'Error communicating with Gemini API',
      );
    }
  }
  /**
   * Queries the Gemini API and expects a JSON object conforming to a specific schema.
   * This function handles the JSON parsing internally and returns a typed object.
   *
   * @param prompt The prompt string to send to Gemini.
   * @param accountId The account ID for API key retrieval.
   * @returns A Promise that resolves to the parsed object of type T, or throws an error.
   */
  async queryGeminiForObject<T>(
    prompt: string,
    accountId: number,
    responseSchema: Record<string, any> // Define the expected schema for the object
  ): Promise<T> {
    try {
      const geminiApiKey = await this.getGeminiApiKey({ accountId });
      if (!geminiApiKey) {
        // You might want to throw a specific error here if the API key is mandatory
        throw new InternalServerErrorException('Gemini API key not found for the given account.');
      }
      const AI = new GoogleGenAI({ apiKey: geminiApiKey });
      const response = await AI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema, // Pass the provided schema directly
        },
      });

      // Gemini's generateContent with responseSchema for 'application/json' should directly return the parsed object
      // The 'response.json()' method would be appropriate here if available and directly returns the object.
      // If not, and it still returns 'text', you'll parse it.
      // Based on your original `queryGemini` where `response.text` is used, we'll continue with that,
      // but ideally, with `responseSchema` and `responseMimeType: 'application/json'`,
      // the SDK might provide a direct `.json()` method or `response.result` which is already parsed.

      if (response.text) {
        // Assuming response.text still contains the JSON string even with responseSchema,
        // and that the SDK doesn't automatically parse it into a structured object yet.
        // In newer versions of the SDK or with different configurations, this might be simpler.
        return JSON.parse(response.text) as T;
      } else if ((response as any).result) { // Check for a direct 'result' property as an object
        return (response as any).result as T;
      }

      throw new InternalServerErrorException('Gemini API returned an empty response.');

    } catch (error) {
      this.logger.error('Error calling Gemini API for object response', error);
      // Re-throw if it's an InternalServerErrorException already, or wrap other errors
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error communicating with Gemini API for object response',
      );
    }
  }
}
