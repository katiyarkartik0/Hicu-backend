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

  constructor(private readonly configurationsService: ConfigurationsService) {}

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
    responseSchema: Record<string, any>, // Define the expected schema for the object
  ): Promise<T> {
    try {
      const geminiApiKey = await this.getGeminiApiKey({ accountId });
      if (!geminiApiKey) {
        // You might want to throw a specific error here if the API key is mandatory
        throw new InternalServerErrorException(
          'Gemini API key not found for the given account.',
        );
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
      } else if ((response as any).result) {
        // Check for a direct 'result' property as an object
        return (response as any).result as T;
      }

      throw new InternalServerErrorException(
        'Gemini API returned an empty response.',
      );
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
