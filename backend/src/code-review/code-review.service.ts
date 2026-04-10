import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { OpenAiService } from '../chatbot/openai.service';

@Injectable()
export class CodeReviewService {
  constructor(
    private prisma: PrismaService,
    private openAi: OpenAiService,
  ) {}

  /**
   * Fetch an existing AI review for a submission.
   * Returns null if the review has not been generated yet.
   */
  async getReview(submissionId: string, userId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id: submissionId, userId },
      include: { codeReview: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission.codeReview ?? null;
  }

  /**
   * Generate and persist an AI code review for a completed submission.
   * Called automatically after code execution finishes — idempotent.
   */
  async generateAndSave(submissionId: string): Promise<void> {
    // Fetch submission with its challenge details
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          select: { title: true, description: true },
        },
        codeReview: true,
      },
    });

    if (!submission) return;

    // Skip if review already exists or submission still running
    if (submission.codeReview) return;
    if (submission.status === 'PENDING' || submission.status === 'RUNNING') return;

    // Build a human-readable test summary
    const results = submission.testResults as any;
    const testSummary = results?.total
      ? `${results.passed ?? 0}/${results.total} tests passed`
      : 'No test details available';

    try {
      const review = await this.openAi.generateCodeReview({
        code: submission.code,
        language: submission.language,
        challengeTitle: submission.challenge.title,
        challengeDescription: submission.challenge.description,
        passed: submission.status === 'PASSED',
        score: submission.score,
        testResultsSummary: testSummary,
      });

      await this.prisma.codeReview.create({
        data: {
          submissionId,
          complexityTime: review.complexityTime,
          complexitySpace: review.complexitySpace,
          qualityScore: review.qualityScore,
          strengths: review.strengths,
          improvements: review.improvements,
          alternativeApproach: review.alternativeApproach,
          summary: review.summary,
          aiModel: 'gpt-4-turbo-preview',
          tokensUsed: review.tokensUsed,
        },
      });
    } catch (error) {
      // Log but don't crash — review generation is non-critical
      console.error(`[CodeReview] Failed for submission ${submissionId}:`, error.message);
    }
  }
}
