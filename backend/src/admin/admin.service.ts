import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  CreateTrackDto, UpdateTrackDto,
  CreateLessonDto, UpdateLessonDto,
  CreateChallengeDto, UpdateChallengeDto,
} from './dto/admin.dto';
import { paginate, buildPaginatedResponse } from '../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Users ───────────────────────────────────────────────────────────────────

  async getUsers(page: number, limit: number) {
    const { take, skip } = paginate(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip, take,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, isActive: true, createdAt: true, lastLoginAt: true,
          _count: { select: { enrollments: true, submissions: true, certificates: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return buildPaginatedResponse(data, total, page, limit);
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
  }

  // ── Tracks ──────────────────────────────────────────────────────────────────

  async getTracks(page: number, limit: number) {
    const { take, skip } = paginate(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.track.findMany({
        skip, take,
        include: {
          _count: { select: { lessons: true, enrollments: true } },
          createdBy: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.track.count(),
    ]);
    return buildPaginatedResponse(data, total, page, limit);
  }

  async createTrack(dto: CreateTrackDto, instructorId: string) {
    const slug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return this.prisma.track.create({
      data: { ...dto, slug, createdById: instructorId },
    });
  }

  async updateTrack(id: string, dto: UpdateTrackDto) {
    await this.findTrackOrThrow(id);
    return this.prisma.track.update({ where: { id }, data: dto });
  }

  async deleteTrack(id: string) {
    await this.findTrackOrThrow(id);
    await this.prisma.track.delete({ where: { id } });
    return { message: 'Track deleted' };
  }

  private async findTrackOrThrow(id: string) {
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) throw new NotFoundException('Track not found');
    return track;
  }

  // ── Lessons ─────────────────────────────────────────────────────────────────

  async createLesson(trackId: string, dto: CreateLessonDto, instructorId: string) {
    await this.findTrackOrThrow(trackId);
    const slug = dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.lesson.create({
      data: { ...dto, slug, trackId, createdById: instructorId },
    });
  }

  async updateLesson(id: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.lesson.update({ where: { id }, data: dto });
  }

  async deleteLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }

  // ── Challenges ───────────────────────────────────────────────────────────────

  async createChallenge(lessonId: string, dto: CreateChallengeDto) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.challenge.create({ data: { ...dto, lessonId } });
  }

  async updateChallenge(id: string, dto: UpdateChallengeDto) {
    const c = await this.prisma.challenge.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Challenge not found');
    return this.prisma.challenge.update({ where: { id }, data: dto });
  }

  async deleteChallenge(id: string) {
    const c = await this.prisma.challenge.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Challenge not found');
    await this.prisma.challenge.delete({ where: { id } });
    return { message: 'Challenge deleted' };
  }

  // ── Dashboard Stats ──────────────────────────────────────────────────────────

  async getStats() {
    const [users, tracks, lessons, submissions, certificates] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.track.count(),
      this.prisma.lesson.count(),
      this.prisma.submission.count(),
      this.prisma.certificate.count({ where: { status: 'GENERATED' } }),
    ]);
    const passRate = submissions > 0
      ? await this.prisma.submission.count({ where: { status: 'PASSED' } })
        .then((p) => Math.round((p / submissions) * 100))
      : 0;
    return { users, tracks, lessons, submissions, certificates, passRate };
  }
}
