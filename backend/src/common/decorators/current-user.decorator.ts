import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '../../modules/auth/dto/auth-response.dto';

/**
 * Decorator to get current authenticated user from request
 * Usage: @CurrentUser() user: UserResponseDto
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
