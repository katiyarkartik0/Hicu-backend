import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { CreatePineconeDto } from './dto/create-pinecone.dto';
import { UpdatePineconeDto } from './dto/update-pinecone.dto';
import { Product, ShopifyService } from 'src/shopify/shopify.service';
import { Document } from '@langchain/core/documents';
import { v4 as uuidv4 } from 'uuid';

@Controller('pinecone')
export class PineconeController {
  constructor(
    private readonly pineconeService: PineconeService,
    private readonly shopifyService: ShopifyService,
  ) {}

  @Post('createPinecone')
  create(createPineconeDto: CreatePineconeDto) {
    // return this.pineconeService.create(createPineconeDto);
  }

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

  // @MessagePattern('findAllPinecone')
  // findAll() {
  //   return this.pineconeService.findAll();
  // }

  // @MessagePattern('findOnePinecone')
  // findOne(@Payload() id: number) {
  //   return this.pineconeService.findOne(id);
  // }

  // @MessagePattern('updatePinecone')
  // update(@Payload() updatePineconeDto: UpdatePineconeDto) {
  //   return this.pineconeService.update(updatePineconeDto.id, updatePineconeDto);
  // }

  // @MessagePattern('removePinecone')
  // remove(@Payload() id: number) {
  //   return this.pineconeService.remove(id);
  // }
}
