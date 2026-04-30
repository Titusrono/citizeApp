import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { PermissionService } from '../services/permission.service';

interface LoginResponse {
  access_token: string;
}

interface JwtPayload {
  exp?: number;
  role?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly googleAuthUrl = `${this.apiUrl}/google`;

  private currentUserRole$ = new BehaviorSubject<string | null>(null);
  private authState$ = new BehaviorSubject<boolean>(false);
  public readonly authStateObservable$ = this.authState$.asObservable();

  private tokenExpiryTimeoutId: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private permissionService: PermissionService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const valid = this.hasValidToken();
      this.authState$.next(valid);

      if (valid) {
        const role = this.getUserRole();
        this.currentUserRole$.next(role);
        if (role) {
          localStorage.setItem('userRole', role);
        }

        const token = this.getToken();
        const decoded = token ? this.decodeToken(token) : null;

        if (decoded?.exp) {
          this.setTokenExpiryTimeout(decoded.exp);
        }

        // Load permissions asynchronously if user is already logged in
        this.loadUserPermissions().subscribe({
          next: () => console.log('✅ [AUTH] Permissions loaded on app init'),
          error: (err) => console.error('❌ [AUTH] Failed to load permissions on app init:', err)
        });
      }
    }
  }

  /** Register a new user */
  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  /** Login user and store token */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.setToken(res.access_token);
        
        // Store user email and ID for vote tracking
        if (isPlatformBrowser(this.platformId)) {
          const decoded = this.decodeToken(res.access_token);
          if (decoded) {
            if (decoded['email'] || credentials.email) {
              localStorage.setItem('user_email', decoded['email'] || credentials.email);
            }
            if (decoded['userId'] || decoded['sub'] || decoded['_id']) {
              localStorage.setItem('user_id', decoded['userId'] || decoded['sub'] || decoded['_id']);
            }
          }
        }
      }),
      switchMap(() => this.loadUserPermissions()),
      catchError(err => {
        console.error('❌ [AUTH] Error loading permissions after login:', err);
        return of({ access_token: credentials.email });
      })
    );
  }

  /**
   * Load user's permissions and store them in PermissionService
   * This is called after successful login to populate sidebar access
   */
  private loadUserPermissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        console.log('📋 [AUTH] Got user details:', {
          email: user.email,
          role: user.role,
          permissionIdsCount: user.permissionIds?.length || 0,
          permissionIds: user.permissionIds
        });
        
        // Store role in localStorage and update BehaviorSubject
        if (user.role) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('userRole', user.role);
          }
          this.currentUserRole$.next(user.role);
        }
      }),
      switchMap(user => {
        console.log('📋 [AUTH] Processing permissions for:', user.email);
        
        if (!user.permissionIds || user.permissionIds.length === 0) {
          console.warn('⚠️ [AUTH] User has no permission IDs assigned');
          
          // Fallback: try to fetch by names if available
          if (user.permissionNames && user.permissionNames.length > 0) {
            console.log('🔄 [AUTH] Attempting fallback: Fetching full Permission objects by names for', user.permissionNames.length, 'names');
            return this.permissionService.getPermissionsByNames(user.permissionNames).pipe(
              tap(permissions => {
                console.log('✅ [AUTH] Successfully loaded', permissions.length, 'Permission objects by names');
                if (permissions.length > 0) {
                  console.log('📋 [AUTH] Permissions:', permissions.map((p: any) => `${p.action}:${p.resource}`));
                }
                this.permissionService.setUserPermissions(permissions);
              }),
              catchError(nameErr => {
                console.error('❌ [AUTH] Error fetching permissions by names:', {
                  status: nameErr.status,
                  message: nameErr.message
                });
                this.permissionService.setUserPermissions([]);
                return of(user);
              }),
              switchMap(() => of(user))
            );
          }
          
          this.permissionService.setUserPermissions([]);
          return of(user);
        }

        // Fetch full Permission objects from backend by IDs first
        console.log('🔄 [AUTH] Fetching full Permission objects for', user.permissionIds.length, 'IDs');
        return this.permissionService.getPermissionsByIds(user.permissionIds).pipe(
          tap(permissions => {
            console.log('✅ [AUTH] Successfully loaded', permissions.length, 'Permission objects by IDs');
            if (permissions.length > 0) {
              console.log('📋 [AUTH] Permissions:', permissions.map((p: any) => `${p.action}:${p.resource}`));
            }
            // Store permissions in PermissionService
            this.permissionService.setUserPermissions(permissions);
          }),
          catchError(idErr => {
            console.error('❌ [AUTH] Error fetching permissions by IDs:', {
              status: idErr.status,
              message: idErr.message
            });
            
            // Fallback: try to fetch by names
            if (user.permissionNames && user.permissionNames.length > 0) {
              console.log('🔄 [AUTH] Attempting fallback: Fetching by names for', user.permissionNames.length, 'names');
              return this.permissionService.getPermissionsByNames(user.permissionNames).pipe(
                tap(permissions => {
                  console.log('✅ [AUTH] Successfully loaded', permissions.length, 'Permission objects by names (fallback)');
                  if (permissions.length > 0) {
                    console.log('📋 [AUTH] Permissions:', permissions.map((p: any) => `${p.action}:${p.resource}`));
                  }
                  this.permissionService.setUserPermissions(permissions);
                }),
                catchError(nameErr => {
                  console.error('❌ [AUTH] Fallback also failed. Error fetching permissions by names:', {
                    status: nameErr.status,
                    message: nameErr.message
                  });
                  this.permissionService.setUserPermissions([]);
                  return of(user);
                })
              );
            }
            
            // Continue anyway with empty permissions
            this.permissionService.setUserPermissions([]);
            return of(user);
          }),
          switchMap(() => of(user))
        );
      }),
      catchError(err => {
        console.error('❌ [AUTH] Failed to load user profile:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        return of({});
      })
    );
  }

  /** Update password while logged in */
  updatePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-password`, data);
  }

  /** Reset password with token sent to email */
  resetPassword(data: { token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  /** Fetch current logged-in user details */
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  /** Fetch role permissions by role name */
  getRolePermissions(roleName: string): Observable<any> {
    const permissionsApiUrl = `${environment.apiUrl}/permissions`;
    return this.http.get(`${permissionsApiUrl}/roles/name/${roleName}`);
  }

  /** Start Google OAuth login flow */
  googleLogin(): void {
    window.location.href = this.googleAuthUrl;
  }

  /** Log out user and reset state */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Get the current user ID before clearing it
      const userIdBeforeLogout = localStorage.getItem('user_id');
      
      // Remove standard auth tokens
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('userRole');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_subcounty');
      localStorage.removeItem('user_ward');
      
      // IMPORTANT: Clean up any vote-related localStorage entries for this user
      // This prevents vote status from leaking to the next logged-in user
      if (userIdBeforeLogout) {
        const userVotePrefix = `votes_${userIdBeforeLogout}_`;
        console.log('[AuthService] Clearing vote history for user:', userIdBeforeLogout);
        
        Object.keys(localStorage)
          .filter(key => key.startsWith(userVotePrefix))
          .forEach(key => {
            console.log('[AuthService] Removing vote storage:', key);
            localStorage.removeItem(key);
          });
      }
    }

    // Clear permissions from PermissionService
    this.permissionService.setUserPermissions([]);

    this.currentUserRole$.next(null);
    this.authState$.next(false);
    this.clearTokenExpiryTimeout();
    this.router.navigate(['/']);
  }

  /** Returns observable login state */
  isLoggedIn(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  /** Get token from localStorage */
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  /** Set token and initialize session state */
  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }

    const decoded = this.decodeToken(token);
    const role = decoded?.role ?? null;
    this.currentUserRole$.next(role);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userRole', role || '');
    }
    this.authState$.next(true);

    if (decoded?.exp) {
      this.setTokenExpiryTimeout(decoded.exp);
    }
  }

  /** Synchronously get current role */
  getRole(): string | null {
    return this.currentUserRole$.value;
  }

  /** Decode and return role from JWT */
  getUserRole(): string | null {
    const token = this.getToken();
    return token ? this.decodeToken(token)?.role ?? null : null;
  }

  /** Observable for role stream */
  getRoleStream(): Observable<string | null> {
    return this.currentUserRole$.asObservable();
  }

  /** Decode JWT payload safely */
  private decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /** Check if stored token is valid */
  private hasValidToken(): boolean {
    const token = this.getToken();
    const decoded = token ? this.decodeToken(token) : null;

    if (!decoded?.exp) return false;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  }

  /** Set auto-logout based on token expiry */
  private setTokenExpiryTimeout(expiryUnix: number): void {
    const now = Math.floor(Date.now() / 1000);
    const expiresInMs = (expiryUnix - now) * 1000;

    if (expiresInMs <= 0) {
      this.logout();
      return;
    }

    this.clearTokenExpiryTimeout();

    this.tokenExpiryTimeoutId = setTimeout(() => {
      this.logout();
    }, expiresInMs);
  }

  /** Clear existing token expiry timer */
  private clearTokenExpiryTimeout(): void {
    if (this.tokenExpiryTimeoutId) {
      clearTimeout(this.tokenExpiryTimeoutId);
      this.tokenExpiryTimeoutId = null;
    }
  }

  /** Get user email from localStorage or token */
  getUserEmail(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const email = localStorage.getItem('user_email');
    if (email) return email;

    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.['email'] || decoded?.['sub'] || null;
    }
    return null;
  }

  /** Get user ID from localStorage or token */
  getUserId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const userId = localStorage.getItem('user_id');
    if (userId) return userId;

    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.['userId'] || decoded?.['sub'] || decoded?.['_id'] || null;
    }
    return null;
  }
}
