import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog } from '../../services/blogs.service';

interface FormErrors {
  title?: string;
  author?: string;
  category?: string;
  summary?: string;
  content?: string;
}

@Component({
  selector: 'app-blog-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-admin-form.component.html',
  styleUrls: ['./blog-admin-form.component.scss']
})
export class BlogAdminFormComponent {
  @Input() data: Blog = {
    title: '',
    date: '',
    summary: '',
    category: '',
    content: '',
    author: '',
    publishDate: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};

  @Output() submit = new EventEmitter<Blog>();
  @Output() close = new EventEmitter<void>();

  categoryOptions = [
    'Governance',
    'Infrastructure',
    'Health',
    'Education',
    'Environment',
    'Public Safety',
  ];

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName as keyof Blog]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Blog title is required';
        } else if (value.length < 5) {
          this.errors.title = 'Title must be at least 5 characters';
        } else if (value.length > 200) {
          this.errors.title = 'Title cannot exceed 200 characters';
        }
        break;

      case 'author':
        if (!value) {
          this.errors.author = 'Author name is required';
        } else if (value.length < 3) {
          this.errors.author = 'Author name must be at least 3 characters';
        }
        break;

      case 'category':
        if (!value) {
          this.errors.category = 'Category is required';
        }
        break;

      case 'summary':
        if (!value) {
          this.errors.summary = 'Summary is required';
        } else if (value.length < 20) {
          this.errors.summary = 'Summary must be at least 20 characters';
        } else if (value.length > 500) {
          this.errors.summary = 'Summary cannot exceed 500 characters';
        }
        break;

      case 'content':
        if (!value) {
          this.errors.content = 'Content is required';
        } else if (value.length < 50) {
          this.errors.content = 'Content must be at least 50 characters';
        } else if (value.length > 5000) {
          this.errors.content = 'Content cannot exceed 5000 characters';
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'author', 'category', 'summary', 'content'];
    let isValid = true;
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  }

  markFieldTouched(fieldName: string) {
    this.touched[fieldName] = true;
    this.validateField(fieldName);
  }

  hasError(fieldName: string): boolean {
    return (this.touched[fieldName] || false) && !!this.errors[fieldName as keyof FormErrors];
  }

  hasSuccess(fieldName: string): boolean {
    return (this.touched[fieldName] || false) && !this.errors[fieldName as keyof FormErrors] && !!this.data[fieldName as keyof Blog];
  }

  getFieldCharCount(fieldName: string): string {
    return (this.data[fieldName as keyof Blog]?.toString().length || 0).toString();
  }

  onSubmit() {
    if (this.validateForm()) {
      this.submit.emit(this.data);
    }
  }

  onReset() {
    this.data = {
      title: '',
      date: '',
      summary: '',
      category: '',
      content: '',
      author: '',
      publishDate: ''
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}
