import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great article! Very helpful.',
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiProperty({
    description: 'Article ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'Article ID must be a string' })
  @IsNotEmpty({ message: 'Article ID is required' })
  articleId: string;

  @ApiPropertyOptional({
    description: 'Parent comment ID (for replies)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString({ message: 'Parent ID must be a string' })
  parentId?: string;
}
