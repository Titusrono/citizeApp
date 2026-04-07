import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Blog, BlogsService } from '../../../../../services/blogs.service';

@Component({
  selector: 'app-blog-citizen-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-citizen-list.component.html',
  styleUrls: ['./blog-citizen-list.component.scss']
})
export class BlogCitizenListComponent implements OnInit {
  blogs: Blog[] = [];
  expandedBlogId: string | null = null;
  isLoading = false;
  errorMessage = '';

  // Configuration for truncated preview
  previewLength = 150; // Number of characters to show before "Read More"

  constructor(private blogsService: BlogsService) {}

  ngOnInit() {
    this.fetchBlogs();
  }

  fetchBlogs() {
    this.isLoading = true;
    this.blogsService.getBlogs().subscribe({
      next: (data: Blog[]) => {
        this.blogs = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load blogs.';
        this.isLoading = false;
      },
    });
  }

  toggleExpandBlog(blogId: string | undefined) {
    if (!blogId) return;
    this.expandedBlogId = this.expandedBlogId === blogId ? null : blogId;
  }

  isExpanded(blogId: string | undefined): boolean {
    return this.expandedBlogId === blogId;
  }

  getDisplayContent(content: string, blogId: string | undefined): string {
    if (this.isExpanded(blogId)) {
      return content;
    }
    return content.length > this.previewLength
      ? content.substring(0, this.previewLength) + '...'
      : content;
  }

  shouldShowReadMore(content: string): boolean {
    return content.length > this.previewLength;
  }
}
