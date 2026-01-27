import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersregService {
  private apiUrl = 'http://localhost:3000/users'; // Update this if needed

  constructor(private http: HttpClient) {}

  // 👉 GET: Fetch all users
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 👉 GET: Fetch single user by email (safely encoded)
  getUserByEmail(email: string): Observable<any> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<any>(`${this.apiUrl}/email/${encodedEmail}`);
  }

  // 👉 POST: Create new user
  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  // 👉 PUT: Update existing user by email (safely encoded)
  updateUser(email: string, updatedData: any): Observable<any> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.patch<any>(`${this.apiUrl}/email/${encodedEmail}`, updatedData);
  }

  // 👉 DELETE: Delete user by email (safely encoded)
  deleteUser(email: string): Observable<any> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.delete<any>(`${this.apiUrl}/email/${encodedEmail}`);
  }
}
