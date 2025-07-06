import { Injectable } from '@nestjs/common';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';

export type Product = {
  id: number;
  [key: string]: any; // include this if other fields are allowed
};

@Injectable()
export class ShopifyService {
  constructor(private readonly configurationsService: ConfigurationsService) {}
  private async getShopifyConfigurations({
    accountId,
  }: {
    accountId: number;
  }): Promise<{ shopifyApiKey: string; shopifyStoreUrl: string }> {
    const { config: configurations } =
      await this.configurationsService.getConfigurationForAccount({
        integrationName: 'Shopify',
        accountId,
      });
    const shopifyApiKey =
      configurations[CONFIGURATIONS_VARIABLES.SHOPIFY.ACCESS_TOKEN];
    const shopifyStoreUrl =
      configurations[CONFIGURATIONS_VARIABLES.SHOPIFY.SHOPIFY_STORE_URL];
    return { shopifyApiKey, shopifyStoreUrl };
  }

  async listAllProducts({
    accountId,
  }: {
    accountId: number;
  }): Promise<Product[]> {
    console.log(accountId, 'accountId');
    const { shopifyApiKey, shopifyStoreUrl } =
      await this.getShopifyConfigurations({ accountId });
    console.log(shopifyStoreUrl);
    const res = await fetch(
      `${shopifyStoreUrl}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyApiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();
    return data.products;
  }

  async fetchProductByTitle({
    title,
    accountId,
  }: {
    accountId: number;
    title: string;
  }) {
    const { shopifyApiKey, shopifyStoreUrl } =
      await this.getShopifyConfigurations({ accountId });
    const res = await fetch(
      `https://${shopifyStoreUrl}/admin/api/2024-01/products.json?title=${encodeURIComponent(title)}`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyApiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();
    return data.products;
  }

  async fetchProductByTag({
    tag,
    accountId,
  }: {
    accountId: number;
    tag: string;
  }) {
    const { shopifyApiKey, shopifyStoreUrl } =
      await this.getShopifyConfigurations({ accountId });
    const res = await fetch(
      `https://${shopifyStoreUrl}/admin/api/2024-01/products.json?fields=id,title,tags`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyApiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();
    return data.products.filter((product) =>
      product.tags.toLowerCase().includes(tag.toLowerCase()),
    );
  }
}
