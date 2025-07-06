import { Module } from '@nestjs/common';
import { ShopifyService } from './shopify.service';
import { ShopifyController } from './shopify.controller';
import { ConfigurationsModule } from 'src/configurations/configurations.module';

@Module({
  controllers: [ShopifyController],
  providers: [ShopifyService],
  exports: [ShopifyService],
  imports: [ConfigurationsModule],
})
export class ShopifyModule {}
