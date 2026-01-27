import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogsService, Blog } from '../../services/blogs.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blogsdetails',
  templateUrl: './blogsdetails.component.html',
  imports: [CommonModule, RouterLink],
  styleUrls: ['./blogsdetails.component.scss']
})
export class BlogsdetailsComponent implements OnInit {
  blog?: Blog;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private blogsService: BlogsService
  ) {}

  ngOnInit(): void {
    this.loadBlog();
  }

  loadBlog(): void {
    const blogId = this.route.snapshot.paramMap.get('id');

    if (!blogId) {
      this.error = 'No blog ID provided in the route.';
      return;
    }

    this.loading = true;
    this.blogsService.getBlogById(blogId).subscribe({
      next: (data: Blog) => {
        this.blog = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching blog:', err);
        this.error = 'Failed to load the blog article.';
        this.loading = false;
      }
    });
  }
}
