import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'My Awesome Project',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Project description',
    example: 'A project for managing team knowledge',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Project color',
    example: '#3B82F6',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
