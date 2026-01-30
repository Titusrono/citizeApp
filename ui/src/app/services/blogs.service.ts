import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = '/assets/blogs.json'; // Using local JSON file until backend blogs module is created

  constructor(private http: HttpClient) {}

  /** ✅ Get all blogs from local JSON file */
  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  /** ✅ Get a single blog by ID from the blogs array */
  getBlogById(id: string): Observable<Blog> {
    return new Observable(observer => {
      this.getBlogs().subscribe(blogs => {
        const blog = blogs.find(b => b._id === id);
        if (blog) {
          observer.next(blog);
        } else {
          observer.error({ message: 'Blog not found' });
        }
        observer.complete();
      });
    });
  }

  // Note: The following methods are disabled since we're using a local JSON file
  // To enable these, create a backend blogs module with CRUD operations
  
  /** ⚠️ Create blog - requires backend API */
  createBlog(blogData: Partial<Blog>): Observable<Blog> {
    throw new Error('Create blog requires backend API - local JSON is read-only');
  }

  /** ⚠️ Update blog - requires backend API */
  updateBlog(id: string, blogData: Partial<Blog>): Observable<Blog> {
    throw new Error('Update blog requires backend API - local JSON is read-only');
  }

  /** ⚠️ Delete blog - requires backend API */
  deleteBlog(id: string): Observable<{ message: string }> {
    throw new Error('Delete blog requires backend API - local JSON is read-only');
  }
}
