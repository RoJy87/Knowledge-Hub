import { ApiProperty } from '@nestjs/swagger';

export class FavoriteResponseDto {
  @ApiProperty({ description: 'Favorite ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Article ID' })
  articleId: string;

  @ApiProperty({ description: 'Article title' })
  articleTitle: string;

  @ApiProperty({ description: 'Article slug' })
  articleSlug: string;

  @ApiProperty({ description: 'Article excerpt' })
  articleExcerpt?: string;

  @ApiProperty({ description: 'Article cover image' })
  articleCoverImage?: string;

  @ApiProperty({ description: 'Author name' })
  authorName: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}
