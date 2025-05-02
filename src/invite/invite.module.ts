import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AccountMemberModule } from 'src/account-member/account-member.module';
import { EmailModule } from 'src/email/nodemailer/email.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [
    AuthModule,
    AccountMemberModule,
    EmailModule,
    MemberModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '10h' },
      }),
    }),
  ],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
