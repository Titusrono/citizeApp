import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Issue {
  id?: string;
  _id?: string;
  description: string;
  location: string;
  category: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  approved?: boolean;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly API_URL = `${environment.apiUrl}/issues`;

  constructor(private http: HttpClient) {}

  // Get all issues
  getAllIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.API_URL);
  }

  // Get user's own issues (all statuses)
  getUserIssues(userId: string): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.API_URL}?userId=${userId}`);
  }

  // Get approved issues from all users
  getApprovedIssues(): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.API_URL}?approved=true`);
  }

  // Create a new issue
  createIssue(issue: Issue): Observable<Issue> {
    return this.http.post<Issue>(this.API_URL, issue);
  }

  // Get a single issue by ID
  getIssueById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.API_URL}/${id}`);
  }

  // Update an issue
  updateIssue(id: string, issue: Partial<Issue>): Observable<Issue> {
    return this.http.patch<Issue>(`${this.API_URL}/${id}`, issue);
  }

  // Delete an issue
  deleteIssue(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
