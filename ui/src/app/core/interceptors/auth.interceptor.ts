import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding auth for certain endpoints
    const skipAuth = req.url.includes('/auth/login') || 
                    req.url.includes('/auth/register') || 
                    req.url.includes('/assets/') ||
                    req.method === 'GET' && (
                      req.url.includes('/votes') ||
                      req.url.includes('/petitions') ||
                      req.url.includes('/issues') ||
                      req.url.includes('/policies') ||
                      req.url.includes('/townhalls')
                    );

    if (skipAuth) {
      return next.handle(req);
    }

    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Clone the request and add the authorization header
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    // If no token, proceed with original request
    return next.handle(req);
  }
}