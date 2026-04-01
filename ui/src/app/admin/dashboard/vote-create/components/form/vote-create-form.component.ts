import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateVoteCreateDto } from '../../services/vote-create.service';

interface FormErrors {
  title?: string;
  description?: string;
  eligibility?: string;
  endDate?: string;
}

@Component({
  selector: 'app-vote-create-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vote-create-form.component.html',
  styleUrls: ['./vote-create-form.component.scss']
})
export class VoteCreateFormComponent {
  @Input() proposal: CreateVoteCreateDto = {
    title: '',
    description: '',
    eligibility: '',
    endDate: ''
  };
  @Input() isEditing = false;
  @Input() successMessage = '';
  @Input() errorMessage = '';
  @Input() showModal = false;
  @Input() isSubmitting = false;

  @Output() submit = new EventEmitter<CreateVoteCreateDto>();
  @Output() close = new EventEmitter<void>();

  errors: FormErrors = {};
  touched: { [key: string]: boolean } = {};

  validateField(fieldName: string): boolean {
    const value = this.proposal[fieldName as keyof CreateVoteCreateDto]?.toString().trim();
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

      case 'endDate':
        if (!value) {
          this.errors.endDate = 'End date is required';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            this.errors.endDate = 'End date must be in the future';
          }
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['title', 'description', 'endDate'];
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
    return (this.touched[fieldName] || false) && !this.errors[fieldName as keyof FormErrors] && !!this.proposal[fieldName as keyof CreateVoteCreateDto];
  }

  getDescriptionCharCount(): string {
    return (this.proposal.description?.length || 0).toString();
  }

  onSubmit() {
    if (this.validateForm()) {
      this.submit.emit(this.proposal);
    }
  }

  onReset() {
    this.proposal = {
      title: '',
      description: '',
      eligibility: '',
      endDate: ''
    };
    this.errors = {};
    this.touched = {};
  }

  onClose() {
    this.close.emit();
  }
}
