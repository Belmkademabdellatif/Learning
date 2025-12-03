import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  async findOne(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id;
    return this.lessonsService.findOne(id, userId);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark lesson as complete' })
  async markComplete(@Param('id') lessonId: string, @Req() req) {
    return this.lessonsService.markComplete(req.user.id, lessonId);
  }
}
