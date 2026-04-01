import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  title?: string;
  description?: string;
  targetAuthority?: string;
}

@Component({
  selector: 'app-admin-petition-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adminpetition-form.component.html',
  styleUrls: ['./adminpetition-form.component.scss']
})
export class AdminPetitionFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    targetAuthority: '',
    status: 'pending'
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};

  authorities: string[] = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  statuses = ['pending', 'in-review', 'approved', 'rejected', 'resolved'];

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Petition title is required';
        } else if (value.length < 5) {
          this.errors.title = 'Title must be at least 5 characters';
        } else if (value.length > 200) {
          this.errors.title = 'Title cannot exceed 200 characters';
        }
        break;

      case 'description':
        // Description is optional, but validate length if provided
        if (value && value.length < 20) {
          this.errors.description = 'Description must be at least 20 characters';
        } else if (value && value.length > 2000) {
          this.errors.description = 'Description cannot exceed 2000 characters';
        }
        break;

      case 'targetAuthority':
        // Target authority is optional
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title'];  // Only title is required
    let isValid = true;
    fields.forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    // Still validate other fields if they're touched
    if (this.touched['description']) this.validateField('description');
    if (this.touched['targetAuthority']) this.validateField('targetAuthority');
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
      targetAuthority: '',
      status: 'pending'
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}
