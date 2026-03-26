import { ApiProperty } from '@nestjs/swagger';
import { MemberRole } from '@prisma/client';

export class ProjectMemberDto {
  @ApiProperty({ description: 'Member ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Project ID' })
  projectId: string;

  @ApiProperty({ description: 'Member role', enum: MemberRole })
  role: MemberRole;

  @ApiProperty({ description: 'Member since' })
  createdAt: Date;
}

export class ProjectResponseDto {
  @ApiProperty({ description: 'Project ID' })
  id: string;

  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Project description' })
  description?: string;

  @ApiProperty({ description: 'Project slug' })
  slug: string;

  @ApiProperty({ description: 'Project color' })
  color: string;

  @ApiProperty({ description: 'Project active status' })
  isActive: boolean;

  @ApiProperty({ description: 'Creator ID' })
  creatorId: string;

  @ApiProperty({ description: 'Project members', type: [ProjectMemberDto] })
  members?: ProjectMemberDto[];

  @ApiProperty({ description: 'Project creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Project last update date' })
  updatedAt: Date;
}
