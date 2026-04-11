import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import {
  CreateTrackDto, UpdateTrackDto,
  CreateLessonDto, UpdateLessonDto,
  CreateChallengeDto, UpdateChallengeDto,
} from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ── Dashboard ────────────────────────────────────────────────────────────────

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Platform statistics (admin only)' })
  getStats() { return this.adminService.getStats(); }

  // ── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (paginated)' })
  getUsers(@Query() q: PaginationDto) {
    return this.adminService.getUsers(q.page, q.limit);
  }

  @Patch('users/:id/toggle-active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate / deactivate a user account' })
  @ApiParam({ name: 'id' })
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  // ── Tracks ───────────────────────────────────────────────────────────────────

  @Get('tracks')
  @ApiOperation({ summary: 'List all tracks (paginated, published + unpublished)' })
  getTracks(@Query() q: PaginationDto) {
    return this.adminService.getTracks(q.page, q.limit);
  }

  @Post('tracks')
  @ApiOperation({ summary: 'Create a new track' })
  createTrack(@Body() dto: CreateTrackDto, @Req() req) {
    return this.adminService.createTrack(dto, req.user.id);
  }

  @Patch('tracks/:id')
  @ApiOperation({ summary: 'Update a track' })
  @ApiParam({ name: 'id' })
  updateTrack(@Param('id') id: string, @Body() dto: UpdateTrackDto) {
    return this.adminService.updateTrack(id, dto);
  }

  @Delete('tracks/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a track (admin only)' })
  @ApiParam({ name: 'id' })
  deleteTrack(@Param('id') id: string) {
    return this.adminService.deleteTrack(id);
  }

  // ── Lessons ──────────────────────────────────────────────────────────────────

  @Post('tracks/:trackId/lessons')
  @ApiOperation({ summary: 'Add a lesson to a track' })
  @ApiParam({ name: 'trackId' })
  createLesson(
    @Param('trackId') trackId: string,
    @Body() dto: CreateLessonDto,
    @Req() req,
  ) { return this.adminService.createLesson(trackId, dto, req.user.id); }

  @Patch('lessons/:id')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'id' })
  updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
    return this.adminService.updateLesson(id, dto);
  }

  @Delete('lessons/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a lesson (admin only)' })
  @ApiParam({ name: 'id' })
  deleteLesson(@Param('id') id: string) {
    return this.adminService.deleteLesson(id);
  }

  // ── Challenges ────────────────────────────────────────────────────────────────

  @Post('lessons/:lessonId/challenges')
  @ApiOperation({ summary: 'Add a challenge to a lesson' })
  @ApiParam({ name: 'lessonId' })
  createChallenge(@Param('lessonId') lessonId: string, @Body() dto: CreateChallengeDto) {
    return this.adminService.createChallenge(lessonId, dto);
  }

  @Patch('challenges/:id')
  @ApiOperation({ summary: 'Update a challenge' })
  @ApiParam({ name: 'id' })
  updateChallenge(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
    return this.adminService.updateChallenge(id, dto);
  }

  @Delete('challenges/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a challenge (admin only)' })
  @ApiParam({ name: 'id' })
  deleteChallenge(@Param('id') id: string) {
    return this.adminService.deleteChallenge(id);
  }
}
