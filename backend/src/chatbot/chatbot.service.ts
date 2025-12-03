import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { VectorService } from './vector.service';
import { OpenAiService } from './openai.service';

@Injectable()
export class ChatbotService {
  constructor(
    private prisma: PrismaService,
    private vectorService: VectorService,
    private openAiService: OpenAiService,
  ) {}

  async query(userId: string, message: string) {
    // Get relevant context from vector database
    const context = await this.vectorService.search(message, 5);

    // Generate response using OpenAI
    const response = await this.openAiService.generateResponse(message, context);

    // Save chat message
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        message,
        response: response.answer,
        context: context,
        metadata: {
          model: response.model,
          tokensUsed: response.tokensUsed,
        },
      },
    });

    return {
      id: chatMessage.id,
      message,
      response: response.answer,
      sources: context.map((c) => ({
        type: c.contentType,
        title: c.metadata.title,
      })),
    };
  }

  async getHistory(userId: string, limit: number = 20) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        message: true,
        response: true,
        createdAt: true,
      },
    });
  }

  async indexContent() {
    // Index all published tracks
    const tracks = await this.prisma.track.findMany({
      where: { isPublished: true },
    });

    for (const track of tracks) {
      await this.vectorService.indexDocument({
        contentType: 'track',
        contentId: track.id,
        content: `${track.title}\n\n${track.description}`,
        metadata: {
          title: track.title,
          difficulty: track.difficulty,
          tags: track.tags,
        },
      });
    }

    // Index all published lessons
    const lessons = await this.prisma.lesson.findMany({
      where: { isPublished: true },
      include: { track: true },
    });

    for (const lesson of lessons) {
      await this.vectorService.indexDocument({
        contentType: 'lesson',
        contentId: lesson.id,
        content: `${lesson.title}\n\n${lesson.description}\n\n${lesson.content}`,
        metadata: {
          title: lesson.title,
          trackTitle: lesson.track.title,
          estimatedMinutes: lesson.estimatedMinutes,
        },
      });
    }

    // Index challenges
    const challenges = await this.prisma.challenge.findMany({
      include: { lesson: { include: { track: true } } },
    });

    for (const challenge of challenges) {
      await this.vectorService.indexDocument({
        contentType: 'challenge',
        contentId: challenge.id,
        content: `${challenge.title}\n\n${challenge.description}`,
        metadata: {
          title: challenge.title,
          lessonTitle: challenge.lesson.title,
          trackTitle: challenge.lesson.track.title,
          difficulty: challenge.difficulty,
          language: challenge.language,
        },
      });
    }

    return { indexed: tracks.length + lessons.length + challenges.length };
  }
}
