import { Module } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { PineconeController } from './pinecone.controller';
import { ConfigurationsModule } from 'src/configurations/configurations.module';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Module({
  controllers: [PineconeController],
  providers: [PineconeService],
  imports: [ConfigurationsModule, ShopifyModule],
  exports: [PineconeService],
})
export class PineconeModule {}
