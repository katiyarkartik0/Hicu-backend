import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstagramModule } from './providers/instagram/instagram.module';
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
import { ConfigurationsModule } from './configurations/configurations.module';
import { EncryptionModule } from './encryption/encryption.module';
import { ShopifyModule } from './shopify/shopify.module';
import { IgMcpModule } from './igMcp/igMcp.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { LeadsModule } from './leads/leads.module';
import { ProspectsModule } from './prospects/prospects.module';

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
    ConfigurationsModule,
    EncryptionModule,
    ShopifyModule,
    IgMcpModule,
    PineconeModule,
    LeadsModule,
    ProspectsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
