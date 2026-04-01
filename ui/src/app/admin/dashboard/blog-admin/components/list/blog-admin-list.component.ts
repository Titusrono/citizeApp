import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog, BlogsService } from '../../services/blogs.service';
import { BlogAdminFormComponent } from '../form/blog-admin-form.component';

@Component({
  selector: 'app-blog-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BlogAdminFormComponent],
  templateUrl: './blog-admin-list.component.html',
  styleUrls: ['./blog-admin-list.component.scss']
})
export class BlogAdminListComponent implements OnInit {
  currentData: Blog = {
    title: '',
    date: new Date().toISOString().substring(0, 10),
    summary: '',
    category: '',
    content: ''
  };

  items: Blog[] = [];
  successMessage = '';
  errorMessage = '';
  editingBlog: any = null;
  isEditing = false;
  showModal = false;

  categoryOptions = [
    'Governance',
    'Infrastructure',
    'Health',
    'Education',
    'Environment',
    'Public Safety',
  ];

  constructor(private blogsService: BlogsService) {}

  ngOnInit() {
    this.fetchBlogs();
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  fetchBlogs() {
    this.blogsService.getBlogs().subscribe({
      next: (data: Blog[]) => {
        this.items = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load blogs.';
      },
    });
  }

  onFormSubmit(blogData: Blog) {
    if (this.isEditing && this.editingBlog) {
      this.updateBlog();
    } else {
      this.createBlog();
    }
  }

  createBlog() {
    this.blogsService.createBlog(this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Blog created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchBlogs();
      },
      error: () => {
        this.errorMessage = 'Failed to create blog.';
        this.successMessage = '';
      },
    });
  }

  updateBlog() {
    if (!this.editingBlog) return;
    const id = this.editingBlog._id;

    this.blogsService.updateBlog(id, this.currentData).subscribe({
      next: () => {
        this.successMessage = 'Blog updated successfully!';
        this.errorMessage = '';
        this.editingBlog = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchBlogs();
      },
      error: () => {
        this.errorMessage = 'Failed to update blog.';
        this.successMessage = '';
      },
    });
  }

  onEdit(blog: Blog) {
    this.editingBlog = { ...blog };
    this.currentData = { ...blog };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  onDelete(id: string) {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    this.blogsService.deleteBlog(id).subscribe({
      next: () => {
        this.successMessage = 'Blog deleted successfully!';
        this.errorMessage = '';
        this.fetchBlogs();
      },
      error: () => {
        this.errorMessage = 'Failed to delete blog.';
        this.successMessage = '';
      }
    });
  }

  resetForm() {
    this.currentData = {
      title: '',
      date: new Date().toISOString().substring(0, 10),
      summary: '',
      category: '',
      content: ''
    };
    this.isEditing = false;
    this.editingBlog = null;
    this.errorMessage = '';
  }
}
