import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorDto {
  @ApiProperty({ description: 'Author ID' })
  id: string;

  @ApiProperty({ description: 'Author first name' })
  firstName: string;

  @ApiProperty({ description: 'Author last name' })
  lastName: string;

  @ApiProperty({ description: 'Author email' })
  email: string;

  @ApiProperty({ description: 'Author avatar URL' })
  avatar?: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'Comment ID' })
  id: string;

  @ApiProperty({ description: 'Comment content' })
  content: string;

  @ApiProperty({ description: 'Is edited' })
  isEdited: boolean;

  @ApiProperty({ description: 'Is deleted' })
  isDeleted: boolean;

  @ApiProperty({ description: 'Author', type: CommentAuthorDto })
  author: CommentAuthorDto;

  @ApiProperty({ description: 'Article ID' })
  articleId: string;

  @ApiProperty({ description: 'Parent comment ID' })
  parentId?: string;

  @ApiProperty({ description: 'Replies', type: [CommentResponseDto] })
  replies?: CommentResponseDto[];

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
