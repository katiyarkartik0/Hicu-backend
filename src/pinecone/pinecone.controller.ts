import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '@langchain/core/documents';

import { PineconeService } from './pinecone.service';
import { Product, ShopifyService } from 'src/shopify/shopify.service';

import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('pinecone')
export class PineconeController {
  constructor(
    private readonly pineconeService: PineconeService,
    private readonly shopifyService: ShopifyService,
  ) {}

  @Get('upsert')
  async upsert(@Query('accountId') accountId: number) {
    const allProducts = await this.shopifyService.listAllProducts({
      accountId,
    });

    function curateMetadata(
      product: Record<string, any>,
    ): Record<string, string> {
      const {
        id,
        title,
        body_html,
        vendor,
        product_type,
        handle,
        tags,
        status,
        admin_graphql_api_id,
        variants,
      } = product;
      const metadata = {
        id,
        title,
        description: body_html,
        vendor,
        productType: product_type,
        handle,
        tags,
        status,
        adminGraphQlApiId: admin_graphql_api_id,
        variants: JSON.stringify(variants),
      };
      return metadata;
    }

    const documents: Document[] = (allProducts || []).map(
      (product: Product) => {
        return new Document({
          pageContent: product.title ?? JSON.stringify(product),
          metadata: curateMetadata(product),
          id: `${product.id}`,
        });
      },
    );

    // Generate unique IDs and pass with documents
    const ids = documents.map((doc) => doc.id ?? uuidv4());

    const result = await this.pineconeService.upsertDocuments(
      accountId,
      documents,
      ids,
    );
    return result;
  }

  @Get('get')
  async get() {
    const res = await this.pineconeService.get();
    return res;
  }
}
