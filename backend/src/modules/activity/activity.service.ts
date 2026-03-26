import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

export interface CreateActivityData {
  userId: string;
  type: ActivityType;
  articleId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an activity
   */
  async logActivity(data: CreateActivityData): Promise<any> {
    return this.prisma.activity.create({
      data: {
        userId: data.userId,
        type: data.type,
        articleId: data.articleId,
        metadata: data.metadata,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  /**
   * Get activity feed for a user
   */
  async getUserActivity(userId: string, page: number = 1, limit: number = 20): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    // Get activity from projects the user is part of
    const userProjects = await this.prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = userProjects.map((m) => m.projectId);

    // Get user's own activity and activity from their projects
    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          OR: [
            { userId },
            {
              article: {
                projectId: {
                  in: projectIds.length > 0 ? projectIds : ['none'],
                },
              },
            },
          ],
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({
        where: {
          OR: [
            { userId },
            {
              article: {
                projectId: {
                  in: projectIds.length > 0 ? projectIds : ['none'],
                },
              },
            },
          ],
        },
      }),
    ]);

    return {
      data: activities.map((activity) => this.mapActivityToResponse(activity)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get global activity feed
   */
  async getGlobalActivity(page: number = 1, limit: number = 20): Promise<{
    data: any[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          article: {
            status: 'PUBLISHED',
          },
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({
        where: {
          article: {
            status: 'PUBLISHED',
          },
        },
      }),
    ]);

    return {
      data: activities.map((activity) => this.mapActivityToResponse(activity)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Map Prisma activity to response DTO
   */
  private mapActivityToResponse(activity: any): any {
    return {
      id: activity.id,
      type: activity.type,
      metadata: activity.metadata,
      user: {
        id: activity.user.id,
        firstName: activity.user.firstName,
        lastName: activity.user.lastName,
        avatar: activity.user.avatar,
      },
      articleId: activity.article?.id,
      articleTitle: activity.article?.title,
      createdAt: activity.createdAt,
    };
  }
}
