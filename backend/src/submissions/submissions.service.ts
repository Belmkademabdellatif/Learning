import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ExecutorService } from '../executor/executor.service';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(
    private prisma: PrismaService,
    private executorService: ExecutorService,
  ) {}

  async submit(userId: string, challengeId: string, code: string) {
    // Get challenge
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Create submission
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        challengeId,
        code,
        language: challenge.language,
        status: SubmissionStatus.PENDING,
        score: 0,
        testResults: {},
      },
    });

    // Execute code asynchronously
    this.executeSubmission(submission.id, code, challenge).catch((error) => {
      console.error('Execution error:', error);
    });

    return submission;
  }

  private async executeSubmission(submissionId: string, code: string, challenge: any) {
    try {
      // Update status to RUNNING
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.RUNNING },
      });

      // Run tests
      const testCases = challenge.testCases as any[];
      const results = await this.executorService.executeCode(
        code,
        challenge.language,
        testCases,
      );

      // Calculate score
      const passedTests = results.details.filter((r) => r.passed).length;
      const totalTests = results.details.length;
      const score = Math.round((passedTests / totalTests) * 100);

      // Update submission
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: results.allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED,
          score,
          testResults: results,
          executionTime: results.totalExecutionTime,
        },
      });
    } catch (error) {
      const isTimeout = error.message === 'Execution timeout';
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: isTimeout ? SubmissionStatus.TIMEOUT : SubmissionStatus.ERROR,
          errorMessage: error.message,
        },
      });
    }
  }

  async getSubmission(id: string, userId: string) {
    return this.prisma.submission.findFirst({
      where: { id, userId },
      include: {
        challenge: {
          select: {
            title: true,
            points: true,
          },
        },
      },
    });
  }
}
