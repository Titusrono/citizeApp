import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'secret-key-change-in-production';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Validating payload:', payload);
    try {
      const user = await this.usersService.findOne(payload.sub);
      console.log('JWT Strategy - User found:', !!user);
      if (!user) {
        console.log('JWT Strategy - User not found for ID:', payload.sub);
        return null;
      }
      return user;
    } catch (error) {
      console.error('JWT Strategy - Error finding user:', error);
      return null;
    }
  }
}