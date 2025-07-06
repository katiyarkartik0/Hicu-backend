import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GeminiModule } from 'src/ai/providers/gemini/gemini.module';
import { AutomationsModule } from 'src/automations/automations.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InstagramController } from './instagram.controller';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

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
    PrismaModule,
    ConfigurationsModule,
  ],
  controllers: [InstagramController],
  providers: [InstagramService],
  exports: [InstagramService],
})
export class InstagramModule {}
