import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  imports: [ConfigurationsModule],
  controllers: [GeminiController],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
