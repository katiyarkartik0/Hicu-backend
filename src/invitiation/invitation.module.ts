import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [UsersModule],
  controllers: [InvitationController],
  providers: [InvitationService],
})
export class InvitationModule {}
