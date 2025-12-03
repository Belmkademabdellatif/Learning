import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        points: true,
        language: true,
        starterCode: true,
        hints: true,
        testCases: true,
        lesson: {
          select: {
            id: true,
            title: true,
            track: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Hide solution and hidden test cases
    const testCases = (challenge.testCases as any[]).map((tc) => ({
      ...tc,
      ...(tc.isHidden && { input: undefined, expected: undefined }),
    }));

    return { ...challenge, testCases };
  }

  async getUserSubmissions(userId: string, challengeId: string) {
    return this.prisma.submission.findMany({
      where: { userId, challengeId },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        score: true,
        executionTime: true,
        submittedAt: true,
      },
    });
  }

  async getSubmissionDetails(id: string, userId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: { id, userId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }
}
