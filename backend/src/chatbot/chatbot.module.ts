import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { VectorService } from './vector.service';
import { OpenAiService } from './openai.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, VectorService, OpenAiService],
  exports: [ChatbotService, VectorService, OpenAiService],
})
export class ChatbotModule {}
