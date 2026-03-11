import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  userRole: string = '';
  showUserMenu = false;
  currentTheme: Theme = 'system';

  constructor(
    private authService: AuthService, 
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.authService.getRoleStream().subscribe(role => {
      this.userRole = role ?? '';
    });

    // Subscribe to theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  getRoleDisplay(): string {
    switch(this.userRole) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'citizen':
        return 'Citizen';
      default:
        return 'User';
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  /**
   * Toggle theme between light, dark, and system
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Get theme icon based on current theme
   */
  getThemeIcon(): string {
    const effectiveTheme = this.themeService.getEffectiveTheme();
    return effectiveTheme === 'dark' ? '☀️' : '🌙';
  }

  /**
   * Get theme display text
   */
  getThemeDisplay(): string {
    switch(this.currentTheme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'System Mode';
      default: return 'System Mode';
    }
  }
}
