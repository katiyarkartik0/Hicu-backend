import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { GeminiModule } from './providers/gemini/gemini.module';

@Module({
  imports: [GeminiModule],
  controllers: [AiController],
  exports: [AiModule],
})
export class AiModule {}
