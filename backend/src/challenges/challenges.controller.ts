import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get challenge by ID' })
  async findOne(@Param('id') id: string) {
    return this.challengesService.findOne(id);
  }

  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user submissions for challenge' })
  async getUserSubmissions(@Param('id') challengeId: string, @Req() req) {
    return this.challengesService.getUserSubmissions(req.user.id, challengeId);
  }
}
