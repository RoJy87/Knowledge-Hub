import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('comments')
@Controller('comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createComment(
    @CurrentUser() user: UserResponseDto,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(user.id, createCommentDto);
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get comments for an article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: [CommentResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async getCommentsByArticle(@Param('articleId') articleId: string): Promise<CommentResponseDto[]> {
    return this.commentsService.getCommentsByArticle(articleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'Comment retrieved successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  async getCommentById(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.getCommentById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update comment' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateComment(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Body('content') content: string,
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(id, user.id, content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete comment (soft delete)' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    const isAdmin = user.role === 'ADMIN';
    return this.commentsService.deleteComment(id, user.id, isAdmin);
  }
}
