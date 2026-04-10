import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private model: string;
  private embeddingModel: string;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });

    this.model = config.get('OPENAI_MODEL') || 'gpt-4-turbo-preview';
    this.embeddingModel = config.get('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text.slice(0, 8000), // Stay within token limits
      });

      if (!response.data?.[0]?.embedding) {
        throw new InternalServerErrorException('Empty embedding response from OpenAI');
      }

      return response.data[0].embedding;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to generate embedding: ${error.message}`);
    }
  }

  /** Sanitize user input to prevent prompt injection */
  private sanitizeQuery(query: string): string {
    return query
      .slice(0, 2000)          // Hard cap on length
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ''); // Strip control chars
  }

  async generateResponse(query: string, context: any[]) {
    const sanitizedQuery = this.sanitizeQuery(query);
    const contextText = context
      .map((c) => (typeof c.content === 'string' ? c.content : ''))
      .join('\n\n---\n\n')
      .slice(0, 12000); // Limit context size

    const systemPrompt = `You are an AI teaching assistant for CodeLearn, an interactive programming learning platform.
Your role is to help students learn programming by answering their questions based on the course content.

Use the following context from our course materials to answer the student's question.
If the answer is not in the context, use your general programming knowledge but indicate this clearly.

Context:
${contextText}

Guidelines:
- Be friendly, patient, and encouraging
- Provide clear, concise explanations
- Include code examples when relevant
- Break down complex concepts into simpler parts
- Suggest related lessons when appropriate
- Encourage hands-on practice`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedQuery },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        answer: completion.choices[0].message.content,
        model: this.model,
        tokensUsed: completion.usage?.total_tokens ?? 0,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to generate AI response: ${error.message}`);
    }
  }
}
