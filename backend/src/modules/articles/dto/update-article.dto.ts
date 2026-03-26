import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ArticleStatus } from '@prisma/client';

export class UpdateArticleDto {
  @ApiPropertyOptional({
    description: 'Article title',
    example: 'Getting Started with NestJS',
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Article content in Markdown format',
    example: '# Introduction\n\nThis is the content...',
  })
  @IsOptional()
  @IsString({ message: 'Content must be a string' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Article excerpt/summary',
    example: 'A brief introduction to NestJS framework',
  })
  @IsOptional()
  @IsString({ message: 'Excerpt must be a string' })
  @MaxLength(500, { message: 'Excerpt must not exceed 500 characters' })
  excerpt?: string;

  @ApiPropertyOptional({
    description: 'Article status',
    enum: ArticleStatus,
  })
  @IsOptional()
  @IsEnum(ArticleStatus, { message: 'Invalid status' })
  status?: ArticleStatus;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://example.com/cover.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Cover image must be a string' })
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Tag IDs',
    example: ['tag1', 'tag2'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: 'Publication date (auto-set when status changes to PUBLISHED)',
  })
  @IsOptional()
  publishedAt?: Date;
}
