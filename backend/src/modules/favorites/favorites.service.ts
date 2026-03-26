import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FavoriteResponseDto } from './dto/favorite-response.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add article to favorites
   */
  async addToFavorites(userId: string, articleId: string): Promise<FavoriteResponseDto> {
    // Verify article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    // Check if already in favorites
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Article is already in favorites');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        articleId,
      },
    });

    return this.mapFavoriteToResponse(favorite, article);
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(userId: string, articleId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  /**
   * Get user's favorites
   */
  async getUserFavorites(userId: string, page: number = 1, limit: number = 10): Promise<{
    data: FavoriteResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              coverImage: true,
              author: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.count({
        where: { userId },
      }),
    ]);

    return {
      data: favorites.map((fav) =>
        this.mapFavoriteToResponse(fav, fav.article),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if article is in user's favorites
   */
  async isFavorite(userId: string, articleId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    return !!favorite;
  }

  /**
   * Toggle favorite (add if not exists, remove if exists)
   */
  async toggleFavorite(userId: string, articleId: string): Promise<{
    isFavorite: boolean;
    favorite?: FavoriteResponseDto;
  }> {
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingFavorite) {
      await this.removeFromFavorites(userId, articleId);
      return { isFavorite: false };
    }

    const favorite = await this.addToFavorites(userId, articleId);
    return { isFavorite: true, favorite };
  }

  /**
   * Map Prisma favorite to response DTO
   */
  private mapFavoriteToResponse(favorite: any, article: any): FavoriteResponseDto {
    return {
      id: favorite.id,
      userId: favorite.userId,
      articleId: favorite.articleId,
      articleTitle: article.title,
      articleSlug: article.slug,
      articleExcerpt: article.excerpt,
      articleCoverImage: article.coverImage,
      authorName: `${article.author.firstName} ${article.author.lastName}`,
      createdAt: favorite.createdAt,
    };
  }
}
