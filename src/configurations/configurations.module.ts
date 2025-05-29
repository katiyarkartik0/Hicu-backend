import { Module } from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { ConfigurationsController } from './configurations.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EncryptionModule } from 'src/encryption/encryption.module';

@Module({
  imports: [PrismaModule, EncryptionModule],
  controllers: [ConfigurationsController],
  providers: [ConfigurationsService],
})
export class ConfigurationsModule {}
