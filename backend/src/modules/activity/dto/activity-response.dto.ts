import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class ActivityUserDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'User first name' })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  lastName: string;

  @ApiProperty({ description: 'User avatar URL' })
  avatar?: string;
}

export class ActivityResponseDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({ description: 'Activity type', enum: ActivityType })
  type: ActivityType;

  @ApiProperty({ description: 'Activity metadata', required: false })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'User who performed the action', type: ActivityUserDto })
  user: ActivityUserDto;

  @ApiProperty({ description: 'Article ID', required: false })
  articleId?: string;

  @ApiProperty({ description: 'Article title', required: false })
  articleTitle?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}
