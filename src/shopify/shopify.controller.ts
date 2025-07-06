import { Controller } from '@nestjs/common';
import { ShopifyService } from './shopify.service';

@Controller()
export class ShopifyController {
  constructor(private readonly shopifyService: ShopifyService) {}
}
