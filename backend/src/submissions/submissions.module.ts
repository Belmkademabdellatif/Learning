import { Module } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { ExecutorModule } from '../executor/executor.module';
import { CodeReviewModule } from '../code-review/code-review.module';

@Module({
  imports: [ExecutorModule, CodeReviewModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
