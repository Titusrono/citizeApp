import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {

  checkAuthStatus(): void {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('userRole');
    
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('User role:', userRole);
    
    if (token) {
      try {
        // Decode JWT token (simple base64 decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token expired:', payload.exp * 1000 < Date.now());
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    console.log('=======================');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}