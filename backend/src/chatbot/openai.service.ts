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

  /**
   * AI Code Mentor: analyse a student's submitted code and return structured feedback.
   */
  async generateCodeReview(params: {
    code: string;
    language: string;
    challengeTitle: string;
    challengeDescription: string;
    passed: boolean;
    score: number;
    testResultsSummary: string; // e.g. "3/5 tests passed"
  }): Promise<{
    complexityTime: string;
    complexitySpace: string;
    qualityScore: number;
    strengths: string[];
    improvements: string[];
    alternativeApproach: string | null;
    summary: string;
    tokensUsed: number;
  }> {
    const systemPrompt = `You are an expert programming mentor reviewing a student's code submission on an interactive learning platform.
Your goal is to give constructive, encouraging, and educational feedback that helps the student improve.

Respond ONLY with a valid JSON object matching this exact shape (no markdown, no extra text):
{
  "complexityTime": "<Big-O time complexity, e.g. O(n)>",
  "complexitySpace": "<Big-O space complexity, e.g. O(1)>",
  "qualityScore": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<concrete suggestion 1>", "<concrete suggestion 2>", "<concrete suggestion 3>"],
  "alternativeApproach": "<optional hint toward a more optimal or elegant solution, or null>",
  "summary": "<one encouraging paragraph summarising the review>"
}

Rules:
- qualityScore reflects readability, correctness, and efficiency (not just pass/fail).
- strengths: 2–4 specific things the student did well.
- improvements: 2–4 actionable suggestions — be specific, not generic.
- alternativeApproach: mention a different algorithmic idea without giving away the full solution. Use null if the current approach is already optimal.
- summary: warm, motivating tone; acknowledge effort regardless of result.`;

    const userMessage = `Challenge: ${params.challengeTitle}
Description: ${params.challengeDescription.slice(0, 500)}
Language: ${params.language}
Result: ${params.passed ? 'PASSED' : 'FAILED'} (score: ${params.score}/100, ${params.testResultsSummary})

Student's code:
\`\`\`${params.language.toLowerCase()}
${params.code.slice(0, 3000)}
\`\`\``;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4, // Lower temp for consistent structured output
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const raw = completion.choices[0].message.content ?? '{}';
      const parsed = JSON.parse(raw);

      return {
        complexityTime: parsed.complexityTime ?? 'Unknown',
        complexitySpace: parsed.complexitySpace ?? 'Unknown',
        qualityScore: Math.min(100, Math.max(0, parseInt(parsed.qualityScore) || 0)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 4) : [],
        alternativeApproach: parsed.alternativeApproach ?? null,
        summary: parsed.summary ?? '',
        tokensUsed: completion.usage?.total_tokens ?? 0,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Code review generation failed: ${error.message}`);
    }
  }
}
