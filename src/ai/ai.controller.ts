import { Body, Controller, Post, Query } from '@nestjs/common';
import { GeminiService } from './providers/gemini/gemini.service';

@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('instagram/classifyInteraction')
  async classifyInteraction(
    @Query('interaction') interaction: string,
    @Body('interactionClasses') interactionClasses: any,
  ) {
    return await this.geminiService.classifyInteraction({
      interaction,
      interactionClasses
    });
  }
}
