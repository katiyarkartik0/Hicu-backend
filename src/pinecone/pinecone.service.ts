import { Injectable } from '@nestjs/common';
import {
  Pinecone as PineconeClient,
  Index as PineconeIndex,
} from '@pinecone-database/pinecone';
import type { Document } from '@langchain/core/documents';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';
import { OpenAIEmbeddings } from '@langchain/openai';
@Injectable()
export class PineconeService {
  private pinecone: PineconeClient;
  private pineconeIndex: PineconeIndex;
  constructor(private readonly configurationsService: ConfigurationsService) {
    this.pinecone = new PineconeClient();
    // Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
    this.pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX!);
  }

  private async getOpenAiApiKey({
    accountId,
  }: {
    accountId: number;
  }): Promise<string> {
    // console.log(process.env.)
    const { config: configurations } =
      await this.configurationsService.getConfigurationForAccount({
        integrationName: 'Open AI',
        accountId,
      });
    const openAiApiKey =
      configurations[CONFIGURATIONS_VARIABLES.OPEN_AI.ACCESS_TOKEN];
    return openAiApiKey;
  }

  async upsertDocuments(
    accountId: number,
    documents: Document[],
    ids: string[],
  ) {
    const openAiApiKey = await this.getOpenAiApiKey({ accountId });
    const embeddings = new OpenAIEmbeddings({
      apiKey: openAiApiKey,
      model: 'text-embedding-3-small',
    });
    const vectors = await Promise.all(
      documents.map(async (doc, i) => {
        const embedding = await embeddings.embedQuery(doc.pageContent);
        return {
          id: ids[i],
          values: embedding,
          metadata: doc.metadata,
        };
      }),
    );

    // Upsert to Pinecone
    const namespace = this.pinecone
      .index(process.env.PINECONE_INDEX!)
      .namespace(`${accountId}`);

    await namespace.upsert(vectors);

    return {
      message: `Upserted ${vectors.length} vectors for accountId: ${accountId}`,
    };
  }

  async search({ accountId, query }: { accountId: number; query: string }) {
    const openAiApiKey = await this.getOpenAiApiKey({ accountId });
    const embeddings = new OpenAIEmbeddings({
      apiKey: openAiApiKey,
      model: 'text-embedding-3-small',
    });
    const queryVector = await embeddings.embedQuery(query);

    const namespace = this.pinecone
      .index(process.env.PINECONE_INDEX!)
      .namespace(`${accountId}`);

    const result = await namespace.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const filteredMatches =
      result.matches?.filter((match) => match.score && match.score > 0.5) || [];

    return {
      query,
      matches: filteredMatches,
    };
  }
}
