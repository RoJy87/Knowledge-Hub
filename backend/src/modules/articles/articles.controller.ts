import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto/auth-response.dto';
import { ArticleStatus } from '@prisma/client';

@ApiTags('articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createArticle(
    @CurrentUser() user: UserResponseDto,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.createArticle(user.id, createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles with filters' })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ArticleStatus })
  @ApiQuery({ name: 'tagId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
  })
  async getArticles(
    @Query('projectId') projectId?: string,
    @Query('authorId') authorId?: string,
    @Query('status') status?: ArticleStatus,
    @Query('tagId') tagId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.getArticles({
      projectId,
      authorId,
      status,
      tagId,
      search,
      page: pageNum,
      limit: limitNum,
    });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user articles' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Articles retrieved successfully',
  })
  async getUserArticles(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.articlesService.getUserArticles(user.id, pageNum, limitNum);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async getArticleBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.getArticleBySlug(slug, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article retrieved successfully',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  async getArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.getArticleById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: ArticleResponseDto,
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
  async updateArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.updateArticle(id, user.id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    // Check if user is admin (you might want to add role guard)
    const isAdmin = user.role === 'ADMIN';
    return this.articlesService.deleteArticle(id, user.id, isAdmin);
  }
}
