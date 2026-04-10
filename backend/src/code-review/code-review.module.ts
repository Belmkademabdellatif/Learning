import { Module } from '@nestjs/common';
import { CodeReviewController } from './code-review.controller';
import { CodeReviewService } from './code-review.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [PrismaModule, ChatbotModule],
  controllers: [CodeReviewController],
  providers: [CodeReviewService],
  exports: [CodeReviewService],
})
export class CodeReviewModule {}
