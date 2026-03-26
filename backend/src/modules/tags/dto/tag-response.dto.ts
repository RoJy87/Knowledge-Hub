import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Tag name' })
  name: string;

  @ApiProperty({ description: 'Tag slug' })
  slug: string;

  @ApiProperty({ description: 'Tag color' })
  color: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
