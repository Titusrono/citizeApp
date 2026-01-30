import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secret', // Use env variable in production
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