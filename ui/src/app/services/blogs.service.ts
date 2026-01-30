import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Blog {
  _id: string;
  title: string;
  date: string;      // ISO string format from backend
  summary: string;
  category: string;
  content: string;   // full blog content
}

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private apiUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  /** Get all blogs */
  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  /** Get a single blog by ID */
  getBlogById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  /** Create a new blog */
  createBlog(blogData: Partial<Blog>): Observable<Blog> {
    return this.http.post<Blog>(this.apiUrl, blogData);
  }

  /** Update an existing blog */
  updateBlog(id: string, blogData: Partial<Blog>): Observable<Blog> {
    return this.http.patch<Blog>(`${this.apiUrl}/${id}`, blogData);
  }

  /** Delete a blog */
  deleteBlog(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
