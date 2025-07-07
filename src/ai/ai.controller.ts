import { Body, Controller, Post, Query } from '@nestjs/common';
import { GeminiService } from './providers/gemini/gemini.service';

@Controller('ai')
export class AiController {
  constructor(private readonly geminiService: GeminiService) {}
}
