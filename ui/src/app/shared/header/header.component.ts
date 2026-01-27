import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // UI States
  dropdownVisible = false;
  mobileMenuVisible = false;
  mobileAdminMenuVisible = false;
  isProfileOpen = false;
  isDark = false;

  isLoggedIn = false;
  userRole: string | null = null;

  private loginSub?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // ✅ Subscribe to the exposed public observable
    this.loginSub = this.authService.authStateObservable$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      this.userRole = this.authService.getRole();

      // Close menus if logged out
      if (!loggedIn) {
        this.closeMobileMenu();
        this.closeDropdown();
        this.isProfileOpen = false;
      }
    });
  }

  ngOnDestroy() {
    this.loginSub?.unsubscribe();
  }

  // Toggle Admin dropdown (Desktop)
  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  closeDropdown() {
    this.dropdownVisible = false;
  }

  toggleMobileMenu() {
    this.mobileMenuVisible = !this.mobileMenuVisible;
  }

  toggleMobileAdminMenu() {
    this.mobileAdminMenuVisible = !this.mobileAdminMenuVisible;
  }

  closeMobileMenu() {
    this.mobileMenuVisible = false;
    this.mobileAdminMenuVisible = false;
  }

  toggleProfile(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    document.documentElement.classList.toggle('dark', this.isDark);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdown();
    this.isProfileOpen = false;
  }
}
