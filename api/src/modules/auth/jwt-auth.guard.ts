import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JWT Auth Guard - Checking authentication');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JWT Auth Guard - Handle request:', { 
      error: err?.message, 
      userExists: !!user, 
      info: info?.message 
    });
    
    if (err || !user) {
      console.error('JWT Auth Guard - Authentication failed:', err || 'User not found');
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}