import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  title?: string;
  description?: string;
  date?: string;
  link?: string;
}

@Component({
  selector: 'app-virtual-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './virtual-create-form.component.html',
  styleUrls: ['./virtual-create-form.component.scss']
})
export class VirtualCreateFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    date: '',
    link: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Event title is required';
        } else if (value.length < 5) {
          this.errors.title = 'Title must be at least 5 characters';
        } else if (value.length > 200) {
          this.errors.title = 'Title cannot exceed 200 characters';
        }
        break;

      case 'description':
        if (!value) {
          this.errors.description = 'Description is required';
        } else if (value.length < 20) {
          this.errors.description = 'Description must be at least 20 characters';
        } else if (value.length > 2000) {
          this.errors.description = 'Description cannot exceed 2000 characters';
        }
        break;

      case 'date':
        if (!value) {
          this.errors.date = 'Event date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            this.errors.date = 'Event date must be in the future';
          }
        }
        break;

      case 'link':
        if (!value) {
          this.errors.link = 'Event link is required';
        } else {
          try {
            new URL(value);
          } catch {
            this.errors.link = 'Please enter a valid URL';
          }
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'description', 'date', 'link'];
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
    return (this.touched[fieldName] || false) && !this.errors[fieldName as keyof FormErrors] && !!this.data[fieldName];
  }

  getDescriptionCharCount(): string {
    return (this.data.description?.length || 0).toString();
  }

  onSubmit() {
    if (this.validateForm()) {
      this.submit.emit(this.data);
    }
  }

  onReset() {
    this.data = {
      title: '',
      description: '',
      date: '',
      link: ''
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}
