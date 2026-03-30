import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ThemeService, Theme } from '../../services/theme.service';
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
  currentTheme: Theme = 'light';

  isLoggedIn = false;
  userRole: string | null = null;

  private loginSub?: Subscription;


  private themeSub?: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to auth state
    this.loginSub = this.authService.authStateObservable$.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      this.userRole = this.authService.getRole();
      if (!loggedIn) {
        this.closeMobileMenu();
        this.closeDropdown();
        this.isProfileOpen = false;
      }
    });
    // Subscribe to theme changes
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy() {
    this.loginSub?.unsubscribe();
    this.themeSub?.unsubscribe();
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
    this.themeService.toggleTheme();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdown();
    this.isProfileOpen = false;
  }
}
