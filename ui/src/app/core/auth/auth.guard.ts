import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn().pipe(
      take(1), // get latest auth state once
      map(isAuthenticated => {
        if (!isAuthenticated) {
          // Not logged in — redirect to login page, keep returnUrl
          return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
        }

        const expectedRoles = route.data['roles'];
        const userRole = this.authService.getUserRole() ?? '';

        if (expectedRoles) {
          if (Array.isArray(expectedRoles)) {
            if (!expectedRoles.includes(userRole)) {
              // User role not authorized — redirect to unauthorized page
              return this.router.createUrlTree(['/unauthorized']);
            }
          } else {
            if (userRole !== expectedRoles) {
              return this.router.createUrlTree(['/unauthorized']);
            }
          }
        }

        // Authorized
        return true;
      })
    );
  }
}
