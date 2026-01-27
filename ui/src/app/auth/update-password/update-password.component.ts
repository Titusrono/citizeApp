import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  imports: [CommonModule,FormsModule]
})
export class UpdatePasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private authService: AuthService) {}

  onSubmit(form: NgForm) {
    if (form.invalid || this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Please fix the errors in the form.';
      return;
    }

    this.errorMessage = null;

    this.authService.updatePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.successMessage = 'Password updated successfully!';
        form.resetForm();
      },
      error: (err: { error: { message: string; }; }) => {
        this.errorMessage = err.error?.message || 'Failed to update password. Please try again.';
      }
    });
  }
}
