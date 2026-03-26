import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectResponseDto, ProjectMemberDto } from './dto/project-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createProject(
    @CurrentUser() user: UserResponseDto,
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(user.id, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserProjects(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.projectsService.getUserProjects(user.id, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProject(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.getProjectById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateProject(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.updateProject(id, user.id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project (soft delete)' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteProject(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    return this.projectsService.deleteProject(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    type: ProjectMemberDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 409,
    description: 'User is already a member',
  })
  async addMember(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<ProjectMemberDto> {
    return this.projectsService.addMember(id, user.id, addMemberDto);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({
    status: 200,
    description: 'Member removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    return this.projectsService.removeMember(id, user.id, memberId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get project members' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
    type: [ProjectMemberDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getMembers(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ProjectMemberDto[]> {
    return this.projectsService.getMembers(id, user.id);
  }
}
