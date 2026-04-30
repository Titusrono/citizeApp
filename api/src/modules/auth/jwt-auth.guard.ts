import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('JWT Auth Guard - Checking authentication');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JWT Auth Guard - Handle request:', { 
      hasError: !!err,
      userExists: !!user, 
      info: info?.message || info 
    });
    
    if (err) {
      console.error('JWT Auth Guard - Authentication error:', err.message);
      throw err;
    }
    
    if (!user) {
      const errorMsg = info?.message || info || 'Unauthorized';
      console.error('JWT Auth Guard - Authentication failed:', errorMsg);
      throw new Error(errorMsg);
    }
    
    return user;
  }
}