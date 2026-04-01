import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  title?: string;
  description?: string;
  streamUrl?: string;
  startTime?: string;
}

@Component({
  selector: 'app-streaming-live-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './streaminglive-form.component.html',
  styleUrls: ['./streaminglive-form.component.scss']
})
export class StreamingLiveFormComponent {
  @Input() data: any = {
    title: '',
    description: '',
    streamUrl: '',
    startTime: ''
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
  private initialData: any = null;

  ngOnInit() {
    this.initialData = { ...this.data };
  }

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'title':
        if (!value) {
          this.errors.title = 'Stream title is required';
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

      case 'streamUrl':
        if (!value) {
          this.errors.streamUrl = 'Stream URL is required';
        } else {
          try {
            new URL(value);
          } catch {
            this.errors.streamUrl = 'Please enter a valid URL';
          }
        }
        break;

      case 'startTime':
        if (!value) {
          this.errors.startTime = 'Start time is required';
        } else {
          const selectedDate = new Date(value);
          const now = new Date();
          if (selectedDate < now) {
            this.errors.startTime = 'Start time must be in the future';
          }
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'description', 'streamUrl', 'startTime'];
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

  onSubmit(): void {
    if (this.validateForm()) {
      this.submit.emit(this.data);
    }
  }

  onReset(): void {
    if (this.initialData) {
      this.data = { ...this.initialData };
    } else {
      this.data = {
        title: '',
        description: '',
        streamUrl: '',
        startTime: ''
      };
    }
    this.errors = {};
    this.touched = {};
  }

  onClose(): void {
    this.close.emit();
  }
}
