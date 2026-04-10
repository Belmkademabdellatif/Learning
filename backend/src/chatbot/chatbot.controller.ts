import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { IsString, MaxLength } from 'class-validator';
import { UserRole } from '@prisma/client';

class ChatQueryDto {
  @IsString()
  @MaxLength(2000)
  message: string;
}

@ApiTags('chatbot')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatbotController {
  constructor(private chatbotService: ChatbotService) {}

  @Post('query')
  @ApiOperation({ summary: 'Ask chatbot a question' })
  async query(@Body() dto: ChatQueryDto, @Req() req) {
    return this.chatbotService.query(req.user.id, dto.message);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history' })
  async getHistory(@Req() req) {
    return this.chatbotService.getHistory(req.user.id);
  }

  @Post('reindex')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reindex all content (admin only)' })
  async reindex() {
    return this.chatbotService.indexContent();
  }
}
