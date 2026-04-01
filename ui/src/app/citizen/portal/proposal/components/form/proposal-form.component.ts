import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  title?: string;
  description?: string;
  topic?: string;
  deadline?: string;
}

@Component({
  selector: 'app-proposal-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './proposal-form.component.html',
  styleUrls: ['./proposal-form.component.scss']
})
export class ProposalFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    topic: '',
    deadline: ''
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

  topics = [
    { value: 'infrastructure', label: '🏗️ Infrastructure' },
    { value: 'education', label: '📚 Education' },
    { value: 'healthcare', label: '⚕️ Healthcare' },
    { value: 'environment', label: '🌍 Environment' },
    { value: 'public-safety', label: '🚓 Public Safety' },
    { value: 'other', label: '📌 Other' }
  ];

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Proposal title is required';
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

      case 'topic':
        if (!value) {
          this.errors.topic = 'Please select a topic';
        }
        break;

      case 'deadline':
        if (!value) {
          this.errors.deadline = 'Deadline date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            this.errors.deadline = 'Deadline must be in the future';
          }
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'description', 'topic', 'deadline'];
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
      topic: '',
      deadline: ''
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}
