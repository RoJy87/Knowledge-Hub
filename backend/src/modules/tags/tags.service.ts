import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique slug from tag name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Create a new tag
   */
  async createTag(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const slug = this.generateSlug(createTagDto.name);

    // Check if tag with same name or slug exists
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        OR: [
          { name: createTagDto.name },
          { slug },
        ],
      },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        slug,
        color: createTagDto.color || '#6B7280',
      },
    });

    return this.mapTagToResponse(tag);
  }

  /**
   * Get all tags
   */
  async getTags(page: number = 1, limit: number = 10): Promise<{
    data: TagResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.tag.count(),
    ]);

    return {
      data: tags.map((tag) => this.mapTagToResponse(tag)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get tag by ID
   */
  async getTagById(id: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.mapTagToResponse(tag);
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with slug ${slug} not found`);
    }

    return this.mapTagToResponse(tag);
  }

  /**
   * Delete tag
   */
  async deleteTag(id: string): Promise<void> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    await this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Get or create tag by name (useful for auto-creating tags)
   */
  async getOrCreateTag(name: string, color?: string): Promise<TagResponseDto> {
    const slug = this.generateSlug(name);

    let tag = await this.prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
    });

    if (!tag) {
      tag = await this.prisma.tag.create({
        data: {
          name,
          slug,
          color: color || '#6B7280',
        },
      });
    }

    return this.mapTagToResponse(tag);
  }

  /**
   * Get popular tags (by article count)
   */
  async getPopularTags(limit: number = 10): Promise<TagResponseDto[]> {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: {
        articles: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return tags.map((tag) => this.mapTagToResponse(tag));
  }

  /**
   * Map Prisma tag to response DTO
   */
  private mapTagToResponse(tag: any): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }
}
