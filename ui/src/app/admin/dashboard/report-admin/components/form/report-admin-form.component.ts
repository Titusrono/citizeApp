import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  description?: string;
  location?: string;
  category?: string;
}

@Component({
  selector: 'app-report-admin-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-admin-form.component.html',
  styleUrl: './report-admin-form.component.scss'
})
export class ReportAdminFormComponent {
  @Input() data: any = {
    description: '',
    location: '',
    category: '',
    images: []
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};

  categories = [
    { value: 'pothole', label: 'Pothole' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'pipeline', label: 'Pipeline Break' },
    { value: 'waste', label: 'Waste Management' },
    { value: 'other', label: 'Other' }
  ];

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'description':
        if (!value) {
          this.errors.description = 'Description is required';
        } else if (value.length < 10) {
          this.errors.description = 'Description must be at least 10 characters';
        } else if (value.length > 1000) {
          this.errors.description = 'Description cannot exceed 1000 characters';
        }
        break;

      case 'location':
        if (!value) {
          this.errors.location = 'Location is required';
        } else if (value.length < 3) {
          this.errors.location = 'Location must be at least 3 characters';
        }
        break;

      case 'category':
        if (!value) {
          this.errors.category = 'Category is required';
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['description', 'location', 'category'];
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
      description: '',
      location: '',
      category: '',
      images: []
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}

