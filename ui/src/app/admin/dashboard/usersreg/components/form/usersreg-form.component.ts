import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FormErrors {
  email?: string;
  username?: string;
  phone_no?: string;
  subCounty?: string;
  ward?: string;
}

@Component({
  selector: 'app-usersreg-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usersreg-form.component.html',
  styleUrls: ['./usersreg-form.component.scss']
})
export class UsersregFormComponent {
  @Input() data: any = {
    email: '',
    username: '',
    phone_no: '',
    subCounty: '',
    ward: ''
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

  subCounties: string[] = [
    'Tetu',
    'Kieni',
    'Mathira East',
    'Mathira West',
    'Othaya',
    'Mukurweini'
  ];

  validateField(fieldName: string): boolean {
    const value = this.data[fieldName]?.toString().trim();
    this.errors[fieldName as keyof FormErrors] = '';

    switch (fieldName) {
      case 'email':
        if (!value) {
          this.errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          this.errors.email = 'Please enter a valid email address';
        }
        break;

      case 'username':
        if (!value) {
          this.errors.username = 'Username is required';
        } else if (value.length < 3) {
          this.errors.username = 'Username must be at least 3 characters';
        } else if (value.length > 50) {
          this.errors.username = 'Username cannot exceed 50 characters';
        }
        break;

      case 'phone_no':
        if (!value) {
          this.errors.phone_no = 'Phone number is required';
        } else if (!/^\+?[\d\s\-()]+$/.test(value) || value.replace(/\D/g, '').length < 10) {
          this.errors.phone_no = 'Please enter a valid phone number';
        }
        break;

      case 'subCounty':
        if (!value) {
          this.errors.subCounty = 'Sub-county selection is required';
        }
        break;

      case 'ward':
        if (!value) {
          this.errors.ward = 'Ward is required';
        } else if (value.length < 2) {
          this.errors.ward = 'Ward name must be at least 2 characters';
        }
        break;
    }

    return !this.errors[fieldName as keyof FormErrors];
  }

  validateForm(): boolean {
    const fields = ['email', 'username', 'phone_no', 'subCounty', 'ward'];
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

  onSubmit(): void {
    if (this.validateForm()) {
      this.submit.emit(this.data);
    }
  }

  onReset(): void {
    this.data = {
      email: '',
      username: '',
      phone_no: '',
      subCounty: '',
      ward: ''
    };
    this.errors = {};
    this.touched = {};
  }

  onClose(): void {
    this.close.emit();
  }
}
