import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '../../../shared/http/http.service';
import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        apiVersion: process.env.INSTAGRAM_API_VERSION,
      },
    })),
    HttpModule,
    GeminiModule,
    AutomationsModule,
    PrismaModule
  ],
  providers: [InstagramService, HttpService],
  exports:[InstagramService]
})
export class InstagramModule {}