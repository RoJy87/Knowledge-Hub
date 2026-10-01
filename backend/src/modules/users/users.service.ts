import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projectMembers: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapUserToResponse(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            projectMembers: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return this.mapUserToResponse(user);
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.findById(userId);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
      include: {
        _count: {
          select: {
            projectMembers: true,
          },
        },
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  async updateByAdmin(userId: string, currentUser: UserResponseDto, updateUserAdminDto: UpdateUserAdminDto): Promise<UserResponseDto> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can manage workspace members');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (currentUser.id === userId && updateUserAdminDto.role && updateUserAdminDto.role !== 'ADMIN') {
      throw new ForbiddenException('You cannot remove your own admin role');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateUserAdminDto.role ? { role: updateUserAdminDto.role } : {}),
        ...(typeof updateUserAdminDto.isActive === 'boolean' ? { isActive: updateUserAdminDto.isActive } : {}),
      },
      include: {
        _count: {
          select: {
            projectMembers: true,
          },
        },
      },
    });

    return this.mapUserToResponse(updatedUser);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  }

  async findAll(currentUser: UserResponseDto, page: number = 1, limit: number = 10): Promise<{
    data: UserResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can view workspace members');
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              projectMembers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((user) => this.mapUserToResponse(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private mapUserToResponse(user: any): UserResponseDto {
    const { password, _count, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      projectsCount: _count?.projectMembers ?? 0,
    } as UserResponseDto;
  }
}