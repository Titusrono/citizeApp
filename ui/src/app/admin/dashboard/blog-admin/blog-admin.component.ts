import { Component, OnInit } from '@angular/core';
//import { Blog, BlogsService } from '../../services/blogs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Blog, BlogsService } from '../../../services/blogs.service';

@Component({
  selector: 'app-blog-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './blog-admin.component.html',
  styleUrls: ['./blog-admin.component.scss'],
})
export class BlogAdminComponent implements OnInit {
  blogs: Blog[] = [];
  blogForm: FormGroup;
  editingBlogId: string | null = null;
  loading = false;
  error = '';

  // Essential 6 categories for dropdown
  categoryOptions = [
    'Governance',
    'Infrastructure',
    'Health',
    'Education',
    'Environment',
    'Public Safety',
  ];

  constructor(private blogsService: BlogsService, private fb: FormBuilder) {
    this.blogForm = this.createForm();
  }

  ngOnInit() {
    this.fetchBlogs();
  }

  private createForm() {
    const today = new Date().toISOString().substring(0, 10); // 'YYYY-MM-DD'
    return this.fb.group({
      title: ['', Validators.required],
      date: [today, Validators.required], // default to today
      summary: ['', Validators.required],
      category: ['', Validators.required],
      content: [''],
    });
  }

  fetchBlogs() {
    this.loading = true;
    this.error = '';
    this.blogsService.getBlogs().subscribe({
      next: (data: Blog[]) => {
        this.blogs = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load blogs.';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (this.blogForm.invalid) return;

    const blogData = this.blogForm.value;

    if (this.editingBlogId) {
      this.blogsService.updateBlog(this.editingBlogId, blogData).subscribe({
        next: () => {
          this.fetchBlogs();
          this.blogForm = this.createForm(); // reset with today’s date
          this.editingBlogId = null;
        },
        error: () => {
          this.error = 'Failed to update blog.';
        },
      });
    } else {
      this.blogsService.createBlog(blogData).subscribe({
        next: () => {
          this.fetchBlogs();
          this.blogForm = this.createForm(); // reset with today’s date
        },
        error: () => {
          this.error = 'Failed to create blog.';
        },
      });
    }
  }

  editBlog(blog: Blog) {
    this.editingBlogId = blog._id;
    this.blogForm.patchValue(blog);
  }

  deleteBlog(id: string) {
    if (confirm('Are you sure you want to delete this blog?')) {
      this.blogsService.deleteBlog(id).subscribe({
        next: () => this.fetchBlogs(),
        error: () => (this.error = 'Failed to delete blog.'),
      });
    }
  }

  cancelEdit() {
    this.editingBlogId = null;
    this.blogForm = this.createForm(); // reset with today’s date
  }
}
