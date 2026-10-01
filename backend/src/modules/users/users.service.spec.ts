import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from './dto/user-response.dto';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: Record<string, jest.Mock> };

  const adminUser: UserResponseDto = {
    id: 'admin-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: Role.ADMIN,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('returns user mapped with projectsCount', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...adminUser, _count: { projectMembers: 3 } });

      const result = await service.findById('admin-1');

      expect(result).toMatchObject({ id: 'admin-1', projectsCount: 3 });
      expect(result).not.toHaveProperty('password');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateByAdmin', () => {
    it('updates role when caller is admin', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...adminUser, id: 'user-2', role: 'USER' });
      prisma.user.update.mockResolvedValue({ ...adminUser, id: 'user-2', role: 'MODERATOR', _count: { projectMembers: 0 } });

      const result = await service.updateByAdmin('user-2', adminUser, { role: 'MODERATOR' });

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-2' }, data: { role: 'MODERATOR' } }),
      );
      expect(result.role).toBe('MODERATOR');
    });

    it('forbids non-admin callers', async () => {
      const plain: UserResponseDto = { ...adminUser, role: Role.USER };

      await expect(service.updateByAdmin('user-2', plain, { role: 'ADMIN' })).rejects.toThrow(ForbiddenException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('forbids admin demoting themselves', async () => {
      prisma.user.findUnique.mockResolvedValue(adminUser);

      await expect(
        service.updateByAdmin('admin-1', adminUser, { role: 'USER' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateByAdmin('missing', adminUser, { isActive: false })).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns paginated users with projectsCount for admin', async () => {
      prisma.user.findMany.mockResolvedValue([
        { ...adminUser, _count: { projectMembers: 2 } },
        { ...adminUser, id: 'u2', role: 'USER', _count: { projectMembers: 0 } },
      ]);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.findAll(adminUser, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].projectsCount).toBe(2);
      expect(result.meta).toEqual({ total: 2, page: 1, limit: 10, totalPages: 1 });
    });

    it('forbids non-admin callers', async () => {
      const plain: UserResponseDto = { ...adminUser, role: Role.USER };

      await expect(service.findAll(plain)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('soft deletes by deactivating', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...adminUser, id: 'u3' });

      await service.deleteUser('u3');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u3' },
        data: { isActive: false },
      });
    });

    it('throws NotFoundException for unknown user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.deleteUser('missing')).rejects.toThrow(NotFoundException);
    });
  });
});