import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MinLength, MaxLength, IsArray } from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'Getting Started with NestJS',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @ApiProperty({
    description: 'Article content in Markdown format',
    example: '# Introduction\n\nThis is the content...',
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiPropertyOptional({
    description: 'Article excerpt/summary',
    example: 'A brief introduction to NestJS framework',
  })
  @IsOptional()
  @IsString({ message: 'Excerpt must be a string' })
  @MaxLength(500, { message: 'Excerpt must not exceed 500 characters' })
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Project ID (if article belongs to a project)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString({ message: 'Project ID must be a string' })
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Article status',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ArticleStatus, { message: 'Invalid status' })
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: 'Tag IDs',
    example: ['tag1', 'tag2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
