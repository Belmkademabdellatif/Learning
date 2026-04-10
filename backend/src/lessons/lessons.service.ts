import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            points: true,
            language: true,
            orderIndex: true,
          },
        },
        track: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if user completed this lesson
    let isCompleted = false;
    if (userId) {
      const completion = await this.prisma.completion.findUnique({
        where: {
          userId_lessonId: { userId, lessonId: id },
        },
      });
      isCompleted = !!completion;
    }

    return { ...lesson, isCompleted };
  }

  async markComplete(userId: string, lessonId: string) {
    // Use upsert to avoid race condition from concurrent requests
    const completion = await this.prisma.completion.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {},
      create: {
        userId,
        lessonId,
      },
    });

    // Update enrollment progress
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { trackId: true },
    });

    if (lesson) {
      await this.updateEnrollmentProgress(userId, lesson.trackId);
    }

    return completion;
  }

  private async updateEnrollmentProgress(userId: string, trackId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_trackId: { userId, trackId },
      },
    });

    if (!enrollment) return;

    const completions = await this.prisma.completion.count({
      where: {
        userId,
        lesson: { trackId },
      },
    });

    const totalLessons = await this.prisma.lesson.count({
      where: { trackId, isPublished: true },
    });

    const percentComplete = totalLessons > 0 ? (completions / totalLessons) * 100 : 0;

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: {
          ...enrollment.progress as object,
          percentComplete: Math.round(percentComplete),
        },
        lastAccessedAt: new Date(),
        ...(percentComplete === 100 && !enrollment.completedAt && { completedAt: new Date() }),
      },
    });
  }
}
