import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Tag already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async createTag(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
    return this.tagsService.createTag(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
  })
  async getTags(
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('limit', new ParseIntPipe()) limit: number = 10,
  ): Promise<any> {
    return this.tagsService.getTags(page, limit);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular tags' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Popular tags retrieved successfully',
    type: [TagResponseDto],
  })
  async getPopularTags(@Query('limit', new ParseIntPipe()) limit: number = 10): Promise<TagResponseDto[]> {
    return this.tagsService.getPopularTags(limit);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get tag by slug' })
  @ApiParam({ name: 'slug', description: 'Tag slug' })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  async getTagBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    return this.tagsService.getTagBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  async getTagById(@Param('id') id: string): Promise<TagResponseDto> {
    return this.tagsService.getTagById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteTag(@Param('id') id: string): Promise<void> {
    return this.tagsService.deleteTag(id);
  }
}
