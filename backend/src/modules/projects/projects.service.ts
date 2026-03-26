import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectResponseDto, ProjectMemberDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique slug from project name
   */
  private generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${baseSlug}-${Date.now()}`;
  }

  /**
   * Create a new project
   */
  async createProject(userId: string, createProjectDto: CreateProjectDto): Promise<ProjectResponseDto> {
    try {
      const slug = this.generateSlug(createProjectDto.name);

      // Create project with creator as admin member
      const project = await this.prisma.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          color: createProjectDto.color || '#3B82F6',
          slug,
          creatorId: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      return this.mapProjectToResponse(project);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new InternalServerErrorException('Failed to create project: ' + error.message);
    }
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string, page: number = 1, limit: number = 10): Promise<{
    data: ProjectResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    // Get projects where user is creator or member
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: {
          isActive: true,
          OR: [
            { creatorId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        skip,
        take: limit,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({
        where: {
          isActive: true,
          OR: [
            { creatorId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
      }),
    ]);

    return {
      data: projects.map((project) => this.mapProjectToResponse(project)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user has access
    const hasAccess =
      project.creatorId === userId ||
      project.members.some((member) => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.mapProjectToResponse(project);
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    userId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user is admin of the project
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    });

    if (project.creatorId !== userId && member?.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.mapProjectToResponse(updatedProject);
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(id: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Check if user is creator or admin
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    });

    if (project.creatorId !== userId && member?.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to delete this project');
    }

    // Soft delete by setting isActive to false
    await this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Add member to project
   */
  async addMember(
    projectId: string,
    userId: string,
    addMemberDto: AddMemberDto,
  ): Promise<ProjectMemberDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user is admin of the project
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (project.creatorId !== userId && member?.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to add members to this project');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: addMemberDto.userId,
          projectId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const projectMember = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: addMemberDto.userId,
        role: addMemberDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      id: projectMember.id,
      userId: projectMember.userId,
      projectId: projectMember.projectId,
      role: projectMember.role,
      createdAt: projectMember.createdAt,
    };
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId: string, userId: string, memberId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user is admin of the project
    const member = await this.prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (project.creatorId !== userId && member?.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to remove members from this project');
    }

    await this.prisma.projectMember.delete({
      where: { id: memberId },
    });
  }

  /**
   * Get project members
   */
  async getMembers(projectId: string, userId: string): Promise<ProjectMemberDto[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user has access
    const hasAccess =
      project.creatorId === userId ||
      project.members.some((member) => member.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      projectId: member.projectId,
      role: member.role,
      createdAt: member.createdAt,
    }));
  }

  /**
   * Map Prisma project to response DTO
   */
  private mapProjectToResponse(project: any): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      slug: project.slug,
      color: project.color,
      isActive: project.isActive,
      creatorId: project.creatorId,
      members: project.members?.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        projectId: m.projectId,
        role: m.role,
        createdAt: m.createdAt,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
