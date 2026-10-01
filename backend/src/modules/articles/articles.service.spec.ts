import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ArticleStatus } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityGateway } from '../activity/activity.gateway';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let prisma: {
    article: Record<string, jest.Mock>;
    articleVersion: Record<string, jest.Mock>;
  };
  let activity: { logActivity: jest.Mock };
  let gateway: { broadcast: jest.Mock; broadcastToProject: jest.Mock };

  const baseArticle = {
    id: 'a1',
    title: 'Old title',
    slug: 'old-title-1',
    content: '<p>v1</p>',
    excerpt: null,
    status: ArticleStatus.DRAFT,
    authorId: 'author-1',
    projectId: 'p1',
    viewCount: 0,
    publishedAt: null,
    author: { id: 'author-1', firstName: 'A', lastName: 'U', email: 'a@x.io', avatar: null },
    project: { id: 'p1', name: 'KB' },
    tags: [],
    _count: { comments: 0 },
  };

  beforeEach(async () => {
    prisma = {
      article: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      articleVersion: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    activity = { logActivity: jest.fn().mockResolvedValue({}) };
    gateway = { broadcast: jest.fn(), broadcastToProject: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: PrismaService, useValue: prisma },
        { provide: ActivityService, useValue: activity },
        { provide: ActivityGateway, useValue: gateway },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe('updateArticle', () => {
    it('creates a new version when content changed', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);
      prisma.articleVersion.findFirst.mockResolvedValue({ version: 3 });
      prisma.article.update.mockResolvedValue({
        ...baseArticle,
        content: '<p>v2</p>',
      });

      await service.updateArticle('a1', 'author-1', { content: '<p>v2</p>' });

      expect(prisma.articleVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ articleId: 'a1', version: 4, content: '<p>v2</p>' }),
        }),
      );
      expect(activity.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ARTICLE_UPDATED' }),
      );
    });

    it('logs ARTICLE_PUBLISHED when draft becomes published', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);
      prisma.article.update.mockResolvedValue({
        ...baseArticle,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      });

      await service.updateArticle('a1', 'author-1', { status: 'PUBLISHED' });

      expect(activity.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ARTICLE_PUBLISHED' }),
      );
      expect(gateway.broadcast).toHaveBeenCalledWith('activity:new', expect.anything());
    });

    it('forbids updating by non-author', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);

      await expect(
        service.updateArticle('a1', 'not-author', { title: 'hack' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.article.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown article', async () => {
      prisma.article.findUnique.mockResolvedValue(null);

      await expect(service.updateArticle('missing', 'author-1', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteArticle', () => {
    it('allows author to delete', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);

      await service.deleteArticle('a1', 'author-1');

      expect(prisma.article.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });

    it('forbids non-author non-admin', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);

      await expect(service.deleteArticle('a1', 'random-user')).rejects.toThrow(ForbiddenException);
      expect(prisma.article.delete).not.toHaveBeenCalled();
    });

    it('logs ARTICLE_DELETED after deletion', async () => {
      prisma.article.findUnique.mockResolvedValue(baseArticle);

      await service.deleteArticle('a1', 'author-1');

      expect(activity.logActivity).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ARTICLE_DELETED' }),
      );
    });
  });
});