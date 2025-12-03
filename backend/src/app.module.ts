import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TracksModule } from './tracks/tracks.module';
import { LessonsModule } from './lessons/lessons.module';
import { ChallengesModule } from './challenges/challenges.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ExecutorModule } from './executor/executor.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60,
        limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      },
    ]),

    // Bull Queue for background jobs
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    TracksModule,
    LessonsModule,
    ChallengesModule,
    SubmissionsModule,
    CertificatesModule,
    ChatbotModule,
    ExecutorModule,
    JobsModule,
  ],
})
export class AppModule {}
