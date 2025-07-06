import { Injectable } from '@nestjs/common';
import { CreatePineconeDto } from './dto/create-pinecone.dto';
import { UpdatePineconeDto } from './dto/update-pinecone.dto';
import { OpenAIEmbeddings } from '@langchain/openai';
import {
  Pinecone as PineconeClient,
  Index as PineconeIndex,
} from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import type { Document } from '@langchain/core/documents';
import { ConfigurationsService } from 'src/configurations/configurations.service';
import { CONFIGURATIONS_VARIABLES } from 'src/shared/constants';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';

@Injectable()
export class PineconeService {
  private pinecone: PineconeClient;
  private pineconeIndex: PineconeIndex;
  private embeddingsMicroservice: string;
  constructor(private readonly configurationsService: ConfigurationsService) {
    this.pinecone = new PineconeClient();
    // Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars
    this.pineconeIndex = this.pinecone.Index(process.env.PINECONE_INDEX!);
    this.embeddingsMicroservice = `http://127.0.0.1:8000/api/v1/embeddings/`;
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
    const items = documents.map((doc, i) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
      id: ids[i],
    }));

    const response = await fetch(this.embeddingsMicroservice, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const { vectors } = await response.json();

    if (!vectors || !Array.isArray(vectors)) {
      throw new Error('Invalid embeddings response from microservice');
    }

    const namespace = this.pinecone
      .index(process.env.PINECONE_INDEX!)
      .namespace(`${accountId}`);

    await namespace.upsert(vectors);

    return {
      message: `Upserted ${vectors.length} vectors for accountId: ${accountId}`,
    };
  }
  async get() {
    const res = await this.search({ accountId: 1, query: 'how much does the beanie cost?' });
    return res;
  }
  async search({ accountId, query }: { accountId: number; query: string }) {
    const response = await fetch(this.embeddingsMicroservice, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 'query', pageContent: query, metadata: {} }],
      }),
    });

    const { vectors } = await response.json();

    if (!vectors || !Array.isArray(vectors) || !vectors[0]?.values) {
      throw new Error('Invalid embeddings response for query');
    }

    const queryVector = vectors[0].values;

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
