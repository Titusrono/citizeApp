import { Component, OnInit } from '@angular/core';
import { Blog, BlogsService } from '../../services/blogs.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  imports: [CommonModule],
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  filteredBlogs: Blog[] = [];
  loading = false;
  error = '';
  selectedCategory: string = '';

  // ✅ Category filter options
  categoryOptions: string[] = [
    'Governance',
    'Infrastructure',
    'Health',
    'Education',
    'Environment',
    'Public Safety'
  ];

  constructor(private blogsService: BlogsService, private router: Router) {}

  ngOnInit(): void {
    this.fetchBlogs();
  }

  fetchBlogs(): void {
    this.loading = true;
    this.error = '';

    this.blogsService.getBlogs().subscribe({
      next: (data) => {
        this.blogs = data;
        this.applyCategoryFilter(); // filter immediately on load
        this.loading = false;
      },
      error: (err) => {
        console.error('Blog fetch failed:', err);
        this.error = 'Failed to load blogs. Please try again later.';
        this.loading = false;
      }
    });
  }

  applyCategoryFilter(): void {
    this.filteredBlogs = this.selectedCategory
      ? this.blogs.filter(blog => blog.category === this.selectedCategory)
      : this.blogs;
  }

  goToFullArticle(blogId: string): void {
    if (!blogId) {
      console.warn('No blog ID provided for navigation.');
      return;
    }
    this.router.navigate(['/blogsdetails', blogId]);
  }
}
