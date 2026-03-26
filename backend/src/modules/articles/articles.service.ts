import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto, ArticleListResponseDto } from './dto/article-response.dto';
import { ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique slug from article title
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${baseSlug}-${Date.now()}`;
  }

  /**
   * Create a new article
   */
  async createArticle(userId: string, createArticleDto: CreateArticleDto): Promise<ArticleResponseDto> {
    const slug = this.generateSlug(createArticleDto.title);

    // If project is specified, verify user has access
    if (createArticleDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: createArticleDto.projectId },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${createArticleDto.projectId} not found`);
      }

      const member = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId: createArticleDto.projectId,
          },
        },
      });

      if (project.creatorId !== userId && !member) {
        throw new ForbiddenException('You do not have permission to create articles in this project');
      }
    }

    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug,
        content: createArticleDto.content,
        excerpt: createArticleDto.excerpt,
        status: createArticleDto.status || ArticleStatus.DRAFT,
        authorId: userId,
        projectId: createArticleDto.projectId,
        publishedAt: createArticleDto.status === ArticleStatus.PUBLISHED ? new Date() : null,
        tags: createArticleDto.tagIds
          ? {
              create: createArticleDto.tagIds.map((tagId) => ({
                tagId,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Create initial version
    await this.prisma.articleVersion.create({
      data: {
        articleId: article.id,
        version: 1,
        content: createArticleDto.content,
        changeLog: 'Initial version',
      },
    });

    return this.mapArticleToResponse(article);
  }

  /**
   * Get all articles with pagination and filters
   */
  async getArticles(
    filters: {
      projectId?: string;
      authorId?: string;
      status?: ArticleStatus;
      tagId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<{
    data: ArticleListResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      projectId,
      authorId,
      status,
      tagId,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      status: status || ArticleStatus.PUBLISHED,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.article.count({ where }),
    ]);

    return {
      data: articles.map((article) => this.mapArticleToListResponse(article)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get article by ID with full details
   */
  async getArticleById(id: string, userId?: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Increment view count if not author
    if (userId && userId !== article.authorId) {
      await this.prisma.article.update({
        where: { id },
        data: {
          viewCount: { increment: 1 },
        },
      });
    }

    return this.mapArticleToResponse(article);
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string, userId?: string): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug ${slug} not found`);
    }

    // Increment view count if not author
    if (userId && userId !== article.authorId) {
      await this.prisma.article.update({
        where: { id: article.id },
        data: {
          viewCount: { increment: 1 },
        },
      });
    }

    return this.mapArticleToResponse(article);
  }

  /**
   * Update article
   */
  async updateArticle(
    id: string,
    userId: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Check if user is author or admin
    if (article.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this article');
    }

    // If status is changing to PUBLISHED, set publishedAt
    if (updateArticleDto.status === ArticleStatus.PUBLISHED && article.status !== ArticleStatus.PUBLISHED) {
      updateArticleDto.publishedAt = new Date();
    }

    // Create new version if content changed
    if (updateArticleDto.content && updateArticleDto.content !== article.content) {
      const latestVersion = await this.prisma.articleVersion.findFirst({
        where: { articleId: id },
        orderBy: { version: 'desc' },
      });

      await this.prisma.articleVersion.create({
        data: {
          articleId: id,
          version: (latestVersion?.version || 0) + 1,
          content: updateArticleDto.content,
          changeLog: 'Updated content',
        },
      });
    }

    // Update tags if provided
    const tagsUpdate = updateArticleDto.tagIds
      ? {
          deleteMany: {},
          create: updateArticleDto.tagIds.map((tagId) => ({
            tagId,
          })),
        }
      : undefined;

    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        ...updateArticleDto,
        tags: tagsUpdate,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    return this.mapArticleToResponse(updatedArticle);
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Check if user is author or admin
    if (article.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this article');
    }

    await this.prisma.article.delete({
      where: { id },
    });
  }

  /**
   * Get user's articles
   */
  async getUserArticles(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ArticleListResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.getArticles({ authorId: userId, page, limit });
  }

  /**
   * Get project articles
   */
  async getProjectArticles(
    projectId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ArticleListResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.getArticles({ projectId, page, limit });
  }

  /**
   * Map Prisma article to response DTO
   */
  private mapArticleToResponse(article: any): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      status: article.status,
      viewCount: article.viewCount,
      author: {
        id: article.author.id,
        firstName: article.author.firstName,
        lastName: article.author.lastName,
        email: article.author.email,
        avatar: article.author.avatar,
      },
      projectId: article.projectId,
      projectName: article.project?.name,
      tags: article.tags.map((at: any) => ({
        id: at.tag.id,
        name: at.tag.name,
        slug: at.tag.slug,
        color: at.tag.color,
      })),
      commentsCount: article._count.comments,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      publishedAt: article.publishedAt,
    };
  }

  /**
   * Map Prisma article to list response DTO
   */
  private mapArticleToListResponse(article: any): ArticleListResponseDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImage: article.coverImage,
      status: article.status,
      viewCount: article.viewCount,
      author: {
        id: article.author.id,
        firstName: article.author.firstName,
        lastName: article.author.lastName,
        email: article.author.email,
        avatar: article.author.avatar,
      },
      tags: article.tags.map((at: any) => ({
        id: at.tag.id,
        name: at.tag.name,
        slug: at.tag.slug,
        color: at.tag.color,
      })),
      commentsCount: article._count.comments,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt,
    };
  }
}
