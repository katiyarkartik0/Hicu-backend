import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';

@Module({
  imports: [
    ConfigModule.forFeature(() => ({
      secretKey: process.env.ENCRYPTION_SECRET_KEY,
    })),
  ],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
