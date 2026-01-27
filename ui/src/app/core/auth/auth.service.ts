import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

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
  private readonly apiUrl = 'http://localhost:3000/auth'; // Backend base URL
  private readonly googleAuthUrl = `${this.apiUrl}/google`;

  private currentUserRole$ = new BehaviorSubject<string | null>(null);
  private authState$ = new BehaviorSubject<boolean>(false);
  public readonly authStateObservable$ = this.authState$.asObservable();

  private tokenExpiryTimeoutId: any;

  constructor(
    private http: HttpClient,
    private router: Router,
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
      tap(res => this.setToken(res.access_token))
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

  /** Start Google OAuth login flow */
  googleLogin(): void {
    window.location.href = this.googleAuthUrl;
  }

  /** Log out user and reset state */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('userRole');
    }

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
}
