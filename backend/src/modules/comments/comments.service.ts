import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new comment
   */
  async createComment(userId: string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const { content, articleId, parentId } = createCommentDto;

    // Verify article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    // If parentId is provided, verify parent comment exists and belongs to same article
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
      }

      if (parentComment.articleId !== articleId) {
        throw new BadRequestException('Parent comment belongs to a different article');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        authorId: userId,
        articleId,
        parentId,
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
        replies: {
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
          },
        },
      },
    });

    return this.mapCommentToResponse(comment);
  }

  /**
   * Get comments for an article (with nested replies)
   */
  async getCommentsByArticle(articleId: string): Promise<CommentResponseDto[]> {
    // Verify article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }

    // Get top-level comments (no parent)
    const comments = await this.prisma.comment.findMany({
      where: {
        articleId,
        parentId: null,
        isDeleted: false,
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
        replies: {
          where: {
            isDeleted: false,
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
            replies: {
              where: {
                isDeleted: false,
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map((comment) => this.mapCommentToResponse(comment));
  }

  /**
   * Get comment by ID
   */
  async getCommentById(id: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
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
        replies: {
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
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return this.mapCommentToResponse(comment);
  }

  /**
   * Update comment
   */
  async updateComment(id: string, userId: string, content: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is author
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this comment');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: {
        content,
        isEdited: true,
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
        replies: {
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
          },
        },
      },
    });

    return this.mapCommentToResponse(updatedComment);
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Check if user is author or admin
    if (comment.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    // Soft delete - clear content but keep record for replies
    await this.prisma.comment.update({
      where: { id },
      data: {
        content: '[Deleted]',
        isDeleted: true,
      },
    });
  }

  /**
   * Map Prisma comment to response DTO
   */
  private mapCommentToResponse(comment: any): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      isDeleted: comment.isDeleted,
      author: {
        id: comment.author.id,
        firstName: comment.author.firstName,
        lastName: comment.author.lastName,
        email: comment.author.email,
        avatar: comment.author.avatar,
      },
      articleId: comment.articleId,
      parentId: comment.parentId,
      replies: comment.replies?.map((reply: any) => ({
        id: reply.id,
        content: reply.content,
        isEdited: reply.isEdited,
        isDeleted: reply.isDeleted,
        author: {
          id: reply.author.id,
          firstName: reply.author.firstName,
          lastName: reply.author.lastName,
          email: reply.author.email,
          avatar: reply.author.avatar,
        },
        articleId: reply.articleId,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
      })),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
