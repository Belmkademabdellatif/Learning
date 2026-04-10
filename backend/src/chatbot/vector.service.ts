import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { PrismaService } from '../common/prisma/prisma.service';
import { OpenAiService } from './openai.service';

interface Document {
  contentType: string;
  contentId: string;
  content: string;
  metadata: any;
}

@Injectable()
export class VectorService {
  private client: WeaviateClient;
  private className = 'LearningContent';

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private openAi: OpenAiService,
  ) {
    this.client = weaviate.client({
      scheme: 'http',
      host: config.get('WEAVIATE_URL') || 'localhost:8080',
    });

    this.initializeSchema();
  }

  private async initializeSchema() {
    try {
      const exists = await this.client.schema.classGetter().withClassName(this.className).do();
      if (!exists) {
        await this.client.schema
          .classCreator()
          .withClass({
            class: this.className,
            description: 'Learning content for RAG',
            properties: [
              { name: 'content', dataType: ['text'], description: 'Content text' },
              { name: 'contentType', dataType: ['string'], description: 'Type of content' },
              { name: 'contentId', dataType: ['string'], description: 'Content ID' },
              { name: 'metadata', dataType: ['object'], description: 'Additional metadata' },
            ],
          })
          .do();
      }
    } catch (error) {
      console.error('Error initializing Weaviate schema:', error);
    }
  }

  async indexDocument(doc: Document) {
    if (!doc.content?.trim()) {
      return null;
    }

    // Generate embedding
    const embedding = await this.openAi.generateEmbedding(doc.content);

    // Create object in Weaviate first
    const result = await this.client.data
      .creator()
      .withClassName(this.className)
      .withProperties({
        content: doc.content,
        contentType: doc.contentType,
        contentId: doc.contentId,
        metadata: doc.metadata,
      })
      .withVector(embedding)
      .do();

    // Save reference in Prisma; if this fails, clean up the Weaviate entry
    try {
      await this.prisma.vectorDocument.upsert({
        where: {
          contentType_contentId: {
            contentType: doc.contentType,
            contentId: doc.contentId,
          },
        },
        update: {
          content: doc.content,
          metadata: doc.metadata,
          vectorId: result.id,
        },
        create: {
          contentType: doc.contentType,
          contentId: doc.contentId,
          content: doc.content,
          metadata: doc.metadata,
          vectorId: result.id,
        },
      });
    } catch (prismaError) {
      // Roll back the Weaviate entry to keep stores in sync
      await this.client.data
        .deleter()
        .withClassName(this.className)
        .withId(result.id)
        .do()
        .catch(() => {}); // Best-effort cleanup
      throw prismaError;
    }

    return result.id;
  }

  async search(query: string, limit: number = 5) {
    const safeLimit = Math.min(Math.max(1, limit), 20); // Clamp to [1, 20]
    // Generate embedding for query
    const embedding = await this.openAi.generateEmbedding(query);

    // Search in Weaviate
    const result = await this.client.graphql
      .get()
      .withClassName(this.className)
      .withFields('content contentType contentId metadata')
      .withNearVector({ vector: embedding })
      .withLimit(safeLimit)
      .do();

    return result.data.Get[this.className] || [];
  }
}
