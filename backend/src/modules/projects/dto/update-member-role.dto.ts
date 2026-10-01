import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'Updated member role',
    enum: MemberRole,
    example: MemberRole.EDITOR,
  })
  @IsEnum(MemberRole, { message: 'Invalid role' })
  role: MemberRole;
}