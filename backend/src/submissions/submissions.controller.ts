import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, MaxLength, IsUUID } from 'class-validator';

class SubmitCodeDto {
  @IsString()
  @MaxLength(50000) // 50 KB hard cap on submitted code
  code: string;

  @IsString()
  @IsUUID()
  challengeId: string;
}

@ApiTags('submissions')
@Controller('submissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit code solution' })
  async submit(@Body() dto: SubmitCodeDto, @Req() req) {
    return this.submissionsService.submit(req.user.id, dto.challengeId, dto.code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission by ID' })
  async getSubmission(@Param('id') id: string, @Req() req) {
    return this.submissionsService.getSubmission(id, req.user.id);
  }
}
