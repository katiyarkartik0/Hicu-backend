import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstagramModule } from './webhook/providers/instagram/instagram.module';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { AiModule } from './ai/ai.module';
import { AccountModule } from './account/account.module';
import { MemberModule } from './member/member.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountMemberModule } from './account-member/account-member.module';
import { InviteModule } from './invite/invite.module';
import { AutomationsModule } from './automations/automations.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AccountIntegrationModule } from './account-integration/account-integration.module';
import { EncryptionModule } from './encryption/encryption.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    InstagramModule,
    WebhookModule,
    AuthModule,
    EmailModule,
    AiModule,
    AccountModule,
    MemberModule,
    PrismaModule,
    AccountMemberModule,
    InviteModule,
    AutomationsModule,
    IntegrationsModule,
    AccountIntegrationModule,
    EncryptionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
