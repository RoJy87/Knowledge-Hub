import { Controller, Get, Patch, Delete, Body, Param, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: UserResponseDto): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.findAll(user, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateProfile(
    @CurrentUser() user: UserResponseDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Patch(':id/admin')
  @ApiOperation({ summary: 'Update user role or status (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  async updateByAdmin(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateByAdmin(id, user, updateUserAdminDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteUser(@CurrentUser() user: UserResponseDto): Promise<void> {
    return this.usersService.deleteUser(user.id);
  }
}