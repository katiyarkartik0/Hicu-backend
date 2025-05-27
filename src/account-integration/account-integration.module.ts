import { Module } from '@nestjs/common';
import { AccountIntegrationService } from './account-integration.service';
import { AccountIntegrationController } from './account-integration.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountIntegrationController],
  providers: [AccountIntegrationService],
})
export class AccountIntegrationModule {}
