import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityGateway } from '../activity/activity.gateway';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: {
    project: { findUnique: jest.Mock; create: jest.Mock };
    projectMember: { findUnique: jest.Mock; create: jest.Mock };
  };
  let activity: { logActivity: jest.Mock };
  let gateway: { broadcast: jest.Mock; broadcastToProject: jest.Mock };

  const project = {
    id: 'p1',
    name: 'Knowledge Base',
    slug: 'knowledge-base-1',
    creatorId: 'creator-1',
    isActive: true,
    members: [],
  };

  beforeEach(async () => {
    prisma = {
      project: { findUnique: jest.fn(), create: jest.fn() },
      projectMember: { findUnique: jest.fn(), create: jest.fn() },
    };
    activity = { logActivity: jest.fn().mockResolvedValue({}) };
    gateway = {
      broadcast: jest.fn(),
      broadcastToProject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ActivityService, useValue: activity },
        { provide: ActivityGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe('createProject slug', () => {
    it('generates slug from name with timestamp suffix', async () => {
      prisma.project.create.mockResolvedValue(project);

      await service.createProject('creator-1', { name: 'Knowledge Base' });

      const data = prisma.project.create.mock.calls[0][0].data;
      expect(data.slug).toMatch(/^knowledge-base-\d+$/);
      expect(data.members.create.role).toBe('ADMIN');
    });
  });

  describe('addMember authorization', () => {
    it('allows the project creator', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectMember.findUnique.mockResolvedValue(null);
      prisma.projectMember.create.mockResolvedValue({ id: 'm2', role: 'MEMBER', user: {} });

      const result = await service.addMember('p1', 'creator-1', { userId: 'u9', role: 'MEMBER' });

      expect(result).toMatchObject({ id: 'm2' });
      expect(activity.logActivity).toHaveBeenCalled();
      expect(gateway.broadcast).toHaveBeenCalledWith('activity:new', expect.anything());
    });

    it('allows an existing project ADMIN', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ role: 'ADMIN' }) // caller membership
        .mockResolvedValueOnce(null); // duplicate check
      prisma.projectMember.create.mockResolvedValue({ id: 'm3', role: 'EDITOR', user: {} });

      const result = await service.addMember('p1', 'admin-member-2', { userId: 'u9', role: 'EDITOR' });

      expect(result.role).toBe('EDITOR');
    });

    it('forbids plain members adding people', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectMember.findUnique.mockResolvedValue({ role: 'MEMBER' });

      await expect(
        service.addMember('p1', 'member-3', { userId: 'u9', role: 'MEMBER' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.projectMember.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown project', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(service.addMember('missing', 'u', { userId: 'x', role: 'MEMBER' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when user already member', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectMember.findUnique
        .mockResolvedValueOnce({ role: 'ADMIN' })
        .mockResolvedValueOnce({ id: 'existing', role: 'MEMBER' });

      await expect(
        service.addMember('p1', 'admin-member-2', { userId: 'u9', role: 'MEMBER' }),
      ).rejects.toThrow(ConflictException);
    });

    it('never fails when activity logging throws', async () => {
      prisma.project.findUnique.mockResolvedValue(project);
      prisma.projectMember.findUnique.mockResolvedValue(null);
      prisma.projectMember.create.mockResolvedValue({ id: 'm4', role: 'MEMBER', user: {} });
      activity.logActivity.mockRejectedValue(new Error('db down'));

      const result = await service.addMember('p1', 'creator-1', { userId: 'u9', role: 'MEMBER' });

      expect(result.id).toBe('m4');
    });
  });
});