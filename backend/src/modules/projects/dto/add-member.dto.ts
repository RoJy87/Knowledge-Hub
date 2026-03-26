import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({
    description: 'User ID to add as member',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({
    description: 'Member role',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  @IsEnum(MemberRole, { message: 'Invalid role' })
  role: MemberRole;
}
