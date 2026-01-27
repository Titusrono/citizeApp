import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // Check if user is logged in by verifying token presence
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in, redirect to login page
      return this.router.parseUrl('/login');
    }

    // Get allowed roles from route data
    const allowedRoles = route.data['roles'] as Array<string>;

    // Get user role from localStorage (you can also decode from token here)
    const userRole = localStorage.getItem('userRole');

    // If roles are specified on the route, check if user role matches
    if (allowedRoles && allowedRoles.length > 0) {
      if (allowedRoles.includes(userRole || '')) {
        return true; // Role allowed
      } else {
        // Role not authorized, redirect or show error page
        return this.router.parseUrl('/login');
      }
    }

    // If no roles specified, allow access (public route)
    return true;
  }
}
