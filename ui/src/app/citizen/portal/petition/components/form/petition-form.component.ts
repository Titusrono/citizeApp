import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  targetAuthority?: string;
  targetSignatures?: string;
}

@Component({
  selector: 'app-petition-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './petition-form.component.html',
  styleUrls: ['./petition-form.component.scss']
})
export class PetitionFormComponent implements OnChanges {
  @Input() data: any = {
    title: '',
    description: '',
    targetAuthority: '',
    category: '',
    targetSignatures: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;

  @Output() submit = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Form validation
  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};
  isSubmitting = false;

  categories = [
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'environment', label: 'Environment' },
    { value: 'public-safety', label: 'Public Safety' },
    { value: 'other', label: 'Other' }
  ];

  authorities = [
    'Government',
    'Local Council',
    'Education Department',
    'Environmental Agency',
    'Healthcare Authority'
  ];

  /**
   * Handle input changes - reset validation when data changes (e.g., during edit)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      // Reset touched state when data changes to avoid showing validation errors on edit load
      this.touched = {};
      this.errors = {};
    }
  }

  /**
   * Validate a single field
   */
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
          this.errors.title = 'Title must not exceed 200 characters';
        }
        break;

      case 'description':
        // Description is optional, but validate length if provided
        if (value && value.length < 20) {
          this.errors.description = 'Description must be at least 20 characters';
        } else if (value && value.length > 2000) {
          this.errors.description = 'Description must not exceed 2000 characters';
        }
        break;

      case 'category':
        // Category is optional
        break;

      case 'targetSignatures':
        if (!value) {
          this.errors.targetSignatures = 'Target signatures is required';
        } else if (isNaN(parseInt(value))) {
          this.errors.targetSignatures = 'Must be a valid number';
        } else if (parseInt(value) < 10) {
          this.errors.targetSignatures = 'Minimum target is 10 signatures';
        } else if (parseInt(value) > 100000) {
          this.errors.targetSignatures = 'Maximum target is 100,000 signatures';
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  /**
   * Validate entire form
   */
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
    if (this.touched['category']) this.validateField('category');
    if (this.touched['targetSignatures']) this.validateField('targetSignatures');

    return isValid;
  }

  /**
   * Mark field as touched
   */
  markFieldTouched(fieldName: string): void {
    this.touched[fieldName] = true;
    this.validateField(fieldName);
  }

  /**
   * Form submission
   */
  onSubmit(): void {
    if (!this.validateForm()) {
      Object.keys(this.data).forEach(key => {
        this.touched[key] = true;
      });
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.submit.emit(this.data);
      this.isSubmitting = false;
    }, 500);
  }

  /**
   * Reset form
   */
  onReset(): void {
    this.data = {
      title: '',
      description: '',
      targetAuthority: '',
      category: '',
      targetSignatures: ''
    };
    this.errors = {};
    this.touched = {};
  }

  /**
   * Close modal
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    return this.touched[fieldName] && !!this.errors[fieldName as keyof FormErrors];
  }

  /**
   * Check if field is valid
   */
  hasSuccess(fieldName: string): boolean {
    return this.touched[fieldName] && !this.errors[fieldName as keyof FormErrors] && !!this.data[fieldName]?.toString().trim();
  }

  /**
   * Get character count for description
   */
  getDescriptionCharCount(): number {
    return this.data.description?.length || 0;
  }
}
