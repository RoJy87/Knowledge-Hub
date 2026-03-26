import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class ArticleTagDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag slug' })
  slug: string;

  @ApiProperty({ description: 'Tag color' })
  color: string;
}

export class ArticleAuthorDto {
  @ApiProperty({ description: 'Author ID' })
  id: string;

  @ApiProperty({ description: 'Author first name' })
  firstName: string;

  @ApiProperty({ description: 'Author last name' })
  lastName: string;

  @ApiProperty({ description: 'Author email' })
  email: string;

  @ApiPropertyOptional({ description: 'Author avatar URL' })
  avatar?: string;
}

export class ArticleResponseDto {
  @ApiProperty({ description: 'Article ID' })
  id: string;

  @ApiProperty({ description: 'Article title' })
  title: string;

  @ApiProperty({ description: 'Article slug' })
  slug: string;

  @ApiProperty({ description: 'Article content' })
  content: string;

  @ApiPropertyOptional({ description: 'Article excerpt' })
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  coverImage?: string;

  @ApiProperty({ description: 'Article status', enum: ArticleStatus })
  status: ArticleStatus;

  @ApiProperty({ description: 'View count' })
  viewCount: number;

  @ApiProperty({ description: 'Author', type: ArticleAuthorDto })
  author: ArticleAuthorDto;

  @ApiPropertyOptional({ description: 'Project ID' })
  projectId?: string;

  @ApiPropertyOptional({ description: 'Project name' })
  projectName?: string;

  @ApiProperty({ description: 'Article tags', type: [ArticleTagDto] })
  tags: ArticleTagDto[];

  @ApiProperty({ description: 'Comments count' })
  commentsCount: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Publication date' })
  publishedAt?: Date;
}

export class ArticleListResponseDto {
  @ApiProperty({ description: 'Article ID' })
  id: string;

  @ApiProperty({ description: 'Article title' })
  title: string;

  @ApiProperty({ description: 'Article slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Article excerpt' })
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  coverImage?: string;

  @ApiProperty({ description: 'Article status', enum: ArticleStatus })
  status: ArticleStatus;

  @ApiProperty({ description: 'View count' })
  viewCount: number;

  @ApiProperty({ description: 'Author', type: ArticleAuthorDto })
  author: ArticleAuthorDto;

  @ApiProperty({ description: 'Article tags', type: [ArticleTagDto] })
  tags: ArticleTagDto[];

  @ApiProperty({ description: 'Comments count' })
  commentsCount: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Publication date' })
  publishedAt?: Date;
}
