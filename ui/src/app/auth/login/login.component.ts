import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessage = '⚠️ Please fill all fields correctly.';
      this.autoDismissError();
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;
    this.loading = true;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '✅ Login successful!';
        setTimeout(() => {
          this.successMessage = null;
        }, 3000); // auto dismiss success after 3s

        const role = this.authService.getRole();
        if (role === 'admin') {
          this.router.navigate(['/dashboard/moderator']);
        } else if (role === 'user') {
          this.router.navigate(['/portal/realtimereport']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '❌ Login failed. Please try again.';
        this.autoDismissError();
      },
    });
  }

  loginWithGoogle() {
    this.authService.googleLogin();
  }

  private autoDismissError() {
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000); // auto dismiss error after 3s
  }
}
