import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      ehterealUserCredentials: {
        username: process.env.ETHEREAL_USER,
        password: process.env.ETHEREAL_PASS,
      },
    })),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
