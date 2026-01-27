import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule,FormsModule]
})
export class ResetPasswordComponent {
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private token: string | null = null;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Capture reset token from query params
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.password !== this.confirmPassword) {
      this.errorMessage = 'Please fix the errors in the form.';
      return;
    }

    if (!this.token) {
      this.errorMessage = 'Invalid or missing token.';
      return;
    }

    this.errorMessage = null;

    this.authService.resetPassword({ token: this.token, newPassword: this.password }).subscribe({
      next: () => {
        this.successMessage = 'Password reset successfully! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: { error: { message: string; }; }) => {
        this.errorMessage = err.error?.message || 'Failed to reset password. Please try again.';
      }
    });
  }
}
