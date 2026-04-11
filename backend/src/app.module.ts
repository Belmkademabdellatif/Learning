import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import * as Joi from 'joi';
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
import { CodeReviewModule } from './code-review/code-review.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';

const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().positive().default(6379),
  RATE_LIMIT_TTL: Joi.number().integer().positive().default(60),
  RATE_LIMIT_MAX: Joi.number().integer().positive().default(100),
  OPENAI_API_KEY: Joi.string().required(),
  WEAVIATE_URL: Joi.string().default('http://localhost:8080'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
});

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60),
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ]),
    }),

    // Bull Queue for background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
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
    CodeReviewModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
