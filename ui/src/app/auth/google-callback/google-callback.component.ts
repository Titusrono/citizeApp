import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  imports:[CommonModule,FormsModule, ReactiveFormsModule],
  styleUrls: ['./google-callback.component.scss']
})
export class GoogleCallbackComponent implements OnInit {
onSubmit(_t23: NgForm) {
throw new Error('Method not implemented.');
}
loginWithGoogle() {
throw new Error('Method not implemented.');
}
successMessage: any;
errorMessage: any;
googleRedirecting: any;
email: any;
password: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (params) => {
        const token = params['token'];
        const returnUrl = params['returnUrl']?.trim() || '/dashboard';

        if (token) {
          console.log('✅ Google token received:', token);

          if (isPlatformBrowser(this.platformId)) {
            try {
              this.authService.setToken(token); // Save token in localStorage
              console.log('🔐 Token stored successfully');
            } catch (error) {
              console.error('❌ Error saving token:', error);
              this.router.navigate(['/login'], { queryParams: { error: 'storage' } });
              return;
            }
          } else {
            console.warn('⚠️ Platform not browser, skipping token storage.');
          }

          setTimeout(() => {
            this.router.navigateByUrl(returnUrl);
          }, 500); // small delay for UX
        } else {
          console.warn('❌ No token found.');
          this.router.navigate(['/login'], { queryParams: { error: 'notoken' } });
        }
      },
      error: (err) => {
        console.error('❌ Error handling Google callback:', err);
        this.router.navigate(['/login'], { queryParams: { error: 'callback' } });
      }
    });
  }
}
