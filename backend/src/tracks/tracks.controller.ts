import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tracks')
@Controller('tracks')
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published tracks' })
  async findAll(@Query('difficulty') difficulty?: string, @Query('tags') tags?: string) {
    return this.tracksService.findAll({
      difficulty: difficulty as any,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get track by ID' })
  async findOne(@Param('id') id: string) {
    return this.tracksService.findOne(id);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in track' })
  async enroll(@Param('id') trackId: string, @Req() req) {
    return this.tracksService.enroll(req.user.id, trackId);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get track progress' })
  async getProgress(@Param('id') trackId: string, @Req() req) {
    return this.tracksService.getProgress(req.user.id, trackId);
  }
}
