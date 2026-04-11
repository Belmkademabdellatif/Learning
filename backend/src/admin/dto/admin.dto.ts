import {
  IsString, IsOptional, IsBoolean, IsInt, IsEnum,
  IsArray, IsUrl, Min, MaxLength, MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Difficulty, ProgrammingLanguage } from '@prisma/client';

// ── Tracks ──────────────────────────────────────────────────────────────────

export class CreateTrackDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(100) title: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(2000) description: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImage?: string;
  @ApiProperty({ enum: Difficulty }) @IsEnum(Difficulty) difficulty: Difficulty;
  @ApiProperty() @IsInt() @Min(1) estimatedHours: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) prerequisites?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateTrackDto extends PartialType(CreateTrackDto) {}

// ── Lessons ─────────────────────────────────────────────────────────────────

export class CreateLessonDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(200) title: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(500) description: string;
  @ApiProperty() @IsString() @MinLength(50) content: string;
  @ApiProperty() @IsInt() @Min(1) orderIndex: number;
  @ApiProperty() @IsInt() @Min(1) estimatedMinutes: number;
  @ApiPropertyOptional() @IsOptional() @IsUrl() videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}

// ── Challenges ───────────────────────────────────────────────────────────────

export class CreateChallengeDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(200) title: string;
  @ApiProperty() @IsString() @MinLength(20) description: string;
  @ApiProperty({ enum: Difficulty }) @IsEnum(Difficulty) difficulty: Difficulty;
  @ApiProperty() @IsInt() @Min(0) points: number;
  @ApiProperty({ enum: ProgrammingLanguage }) @IsEnum(ProgrammingLanguage) language: ProgrammingLanguage;
  @ApiProperty() @IsString() starterCode: string;
  @ApiProperty() @IsString() solutionCode: string;
  @ApiProperty({ description: 'Array of test case objects' }) @IsArray() testCases: any[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) hints?: string[];
  @ApiProperty() @IsInt() @Min(1) orderIndex: number;
}

export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {}
