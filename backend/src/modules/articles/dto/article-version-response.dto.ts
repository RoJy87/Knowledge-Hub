import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ArticleVersionResponseDto {
  @ApiProperty({ description: 'Article version ID' })
  id: string;

  @ApiProperty({ description: 'Version number' })
  version: number;

  @ApiProperty({ description: 'Version content snapshot' })
  content: string;

  @ApiPropertyOptional({ description: 'Change log' })
  changeLog?: string;

  @ApiProperty({ description: 'Version creation date' })
  createdAt: Date;
}
