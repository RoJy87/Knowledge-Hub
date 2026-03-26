import { Controller, Get, Post, Delete, Param, UseGuards, Query, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':articleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add article to favorites' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 201,
    description: 'Article added to favorites',
    type: FavoriteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already in favorites',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async addToFavorites(
    @CurrentUser() user: UserResponseDto,
    @Param('articleId') articleId: string,
  ): Promise<FavoriteResponseDto> {
    return this.favoritesService.addToFavorites(user.id, articleId);
  }

  @Delete(':articleId')
  @ApiOperation({ summary: 'Remove article from favorites' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Article removed from favorites',
  })
  @ApiResponse({
    status: 404,
    description: 'Favorite not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async removeFromFavorites(
    @CurrentUser() user: UserResponseDto,
    @Param('articleId') articleId: string,
  ): Promise<void> {
    return this.favoritesService.removeFromFavorites(user.id, articleId);
  }

  @Post('toggle/:articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle favorite status' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status toggled',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async toggleFavorite(
    @CurrentUser() user: UserResponseDto,
    @Param('articleId') articleId: string,
  ): Promise<{ isFavorite: boolean; favorite?: FavoriteResponseDto }> {
    return this.favoritesService.toggleFavorite(user.id, articleId);
  }

  @Get()
  @ApiOperation({ summary: "Get user's favorites" })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Favorites retrieved successfully',
  })
  async getUserFavorites(
    @CurrentUser() user: UserResponseDto,
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('limit', new ParseIntPipe()) limit: number = 10,
  ): Promise<any> {
    return this.favoritesService.getUserFavorites(user.id, page, limit);
  }

  @Get('check/:articleId')
  @ApiOperation({ summary: 'Check if article is in favorites' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Favorite status retrieved',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async isFavorite(
    @CurrentUser() user: UserResponseDto,
    @Param('articleId') articleId: string,
  ): Promise<{ isFavorite: boolean }> {
    const isFavorite = await this.favoritesService.isFavorite(user.id, articleId);
    return { isFavorite };
  }
}
