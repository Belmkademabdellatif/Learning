import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CodeReviewService } from './code-review.service';

@ApiTags('code-review')
@Controller('submissions/:submissionId/review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CodeReviewController {
  constructor(private codeReviewService: CodeReviewService) {}

  @Get()
  @ApiOperation({
    summary: 'Get AI code review for a submission',
    description:
      'Returns the AI mentor feedback for a completed submission. ' +
      'Returns null if the review is still being generated.',
  })
  @ApiParam({ name: 'submissionId', description: 'ID of the submission' })
  @ApiResponse({ status: 200, description: 'Code review or null if not ready yet' })
  @ApiResponse({ status: 404, description: 'Submission not found or not owned by user' })
  async getReview(@Param('submissionId') submissionId: string, @Req() req) {
    return this.codeReviewService.getReview(submissionId, req.user.id);
  }
}
