import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.isLoggedIn().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          return Promise.resolve(this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }));
        }

        // Load permissions if not already loaded
        const currentPermissions = this.permissionService.getUserPermissions();
        if (currentPermissions.length === 0) {
          const userRole = this.authService.getUserRole();
          if (userRole) {
            return this.authService.getRolePermissions(userRole).pipe(
              map((roleData: any) => {
                if (roleData?.permissions) {
                  this.permissionService.setUserPermissions(roleData.permissions);
                }
                return this.authorizeUser(route);
              })
            );
          }
        }

        return Promise.resolve(this.authorizeUser(route));
      })
    );
  }

  private authorizeUser(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'];
    const userRole = this.authService.getUserRole() ?? '';

    if (expectedRoles) {
      if (Array.isArray(expectedRoles)) {
        if (!expectedRoles.includes(userRole)) {
          return this.router.createUrlTree(['/unauthorized']);
        }
      } else {
        if (userRole !== expectedRoles) {
          return this.router.createUrlTree(['/unauthorized']);
        }
      }
    }

    return true;
  }
}
