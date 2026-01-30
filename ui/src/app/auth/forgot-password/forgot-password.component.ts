import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink,
  ],
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // Clear previous messages on submit
    this.message = '';
    this.error = '';

    if (!this.email) {
      this.error = 'Email is required';
      return;
    }

    this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email: this.email })
      .subscribe({
        next: (res) => {
          // Show success message, clear error
          this.message = res.message || 'Reset link sent. Check your email.';
          this.error = '';
        },
        error: (err) => {
          // Show error message, clear success
          this.error = err.error?.message || 'Something went wrong';
          this.message = '';
        }
      });
  }
}
