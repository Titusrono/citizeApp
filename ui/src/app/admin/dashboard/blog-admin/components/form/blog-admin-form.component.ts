import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Blog } from '../../services/blogs.service';

@Component({
  selector: 'app-blog-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-admin-form.component.html'
})
export class BlogAdminFormComponent {
  @Input() data: Blog = {
    title: '',
    date: '',
    summary: '',
    category: '',
    content: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

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

  onSubmit() {
    this.submit.emit(this.data);
  }

  onReset() {
    this.data = {
      title: '',
      date: '',
      summary: '',
      category: '',
      content: ''
    };
  }

  onClose() {
    this.close.emit();
  }
}
