import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Difficulty } from '@prisma/client';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { difficulty?: Difficulty; tags?: string[] }) {
    return this.prisma.track.findMany({
      where: {
        isPublished: true,
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.tags && { tags: { hasSome: filters.tags } }),
      },
      include: {
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            orderIndex: true,
            estimatedMinutes: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }

  async enroll(userId: string, trackId: string) {
    // Verify track exists and is published before enrolling
    const track = await this.prisma.track.findUnique({
      where: { id: trackId },
      select: { id: true, isPublished: true },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    if (!track.isPublished) {
      throw new BadRequestException('Cannot enroll in an unpublished track');
    }

    return this.prisma.enrollment.upsert({
      where: { userId_trackId: { userId, trackId } },
      update: {},
      create: {
        userId,
        trackId,
        progress: { lessonsCompleted: [], challengesCompleted: [], percentComplete: 0 },
      },
    });
  }

  async getProgress(userId: string, trackId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_trackId: { userId, trackId },
      },
      include: {
        track: {
          include: {
            lessons: {
              include: {
                _count: {
                  select: { challenges: true },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Not enrolled in this track');
    }

    // Get user completions
    const completions = await this.prisma.completion.findMany({
      where: {
        userId,
        lesson: { trackId },
      },
      select: { lessonId: true },
    });

    // Only count published lessons for an accurate progress calculation
    const publishedLessons = enrollment.track.lessons.filter((l: any) => l.isPublished !== false);
    const totalLessons = publishedLessons.length;
    const completedLessons = completions.length;
    const percentComplete = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      ...enrollment,
      completedLessons: completions.map((c) => c.lessonId),
      totalLessons,
      percentComplete: Math.round(percentComplete),
    };
  }
}
