import { Module } from '@nestjs/common';
import { AccountIntegrationService } from './account-integration.service';
import { AccountIntegrationController } from './account-integration.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [AccountIntegrationController],
  providers: [AccountIntegrationService],
})
export class AccountIntegrationModule {}
