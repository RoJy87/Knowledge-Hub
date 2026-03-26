import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  /**
   * Validate JWT payload and return user data
   * This method is called automatically by Passport after JWT verification
   */
  async validate(payload: any) {
    // Verify token type is 'access'
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate user exists and is active
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    // Return user object with 'id' field (not 'userId') to match UserResponseDto
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
