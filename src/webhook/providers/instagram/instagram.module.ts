import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '../../../shared/http/http.service';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
        apiVersion: process.env.INSTAGRAM_API_VERSION,
      },
    })),
    HttpModule,
  ],
  providers: [InstagramService, HttpService],
  exports:[InstagramService]
})
export class InstagramModule {}