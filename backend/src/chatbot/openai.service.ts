import { Injectable } from '@nestjs/common';
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
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  }

  async generateResponse(query: string, context: any[]) {
    const contextText = context.map((c) => c.content).join('\n\n---\n\n');

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

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      answer: completion.choices[0].message.content,
      model: this.model,
      tokensUsed: completion.usage.total_tokens,
    };
  }
}
