import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;
  returnUrl: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the returnUrl from query parameters
    this.activatedRoute.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
    });
  }

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

        // Redirect to returnUrl if provided, otherwise use role-based default navigation
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          const role = this.authService.getRole();
          if (role === 'admin' || role === 'super_admin') {
            this.router.navigate(['/dashboard/report-admin']);
          } else {
            this.router.navigate(['/portal/realtimereport']);
          }
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
