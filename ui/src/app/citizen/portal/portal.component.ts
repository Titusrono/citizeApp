import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-portal',
  imports: [RouterLink, CommonModule, RouterOutlet],
  standalone: true,
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],  // fixed typo from styleUrl to styleUrls
})
export class PortalComponent implements OnInit {
  sidebarOpen = true;
  isMobile = false;
  userRole: string = '';
  isLoggedIn: boolean = false;

  navigationItems = [
    {
      path: 'realtimereport',
      label: 'Report Issue',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z',
      color: 'text-red-600 hover:text-red-700'
    },
    {
      path: 'petition',
      label: 'Petitions',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-blue-600 hover:text-blue-700'
    },
    {
      path: 'proposal',
      label: 'Vote on Projects',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-green-600 hover:text-green-700'
    },
    {
      path: 'streaminglive',
      label: 'Virtual Hall',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      color: 'text-purple-600 hover:text-purple-700'
    }
  ];

  constructor(private router: Router, private authService: AuthService) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Subscribe to role stream to reactively capture role after login
    this.authService.getRoleStream().subscribe(role => {
      this.userRole = role ?? '';
    });

    // Determine login status
    this.isLoggedIn = !!this.authService.getToken();

    // Fallback if role not yet set (e.g. on refresh)
    if (!this.userRole) {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) this.userRole = storedRole;
    }

    // Listen for window resize
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'super_admin';
  }

  isActiveRoute(path: string): boolean {
    return this.router.url.includes(path);
  }

  getVisibleNavigationItems() {
    // Citizens see only citizen navigation items, regardless of role
    // Super admins accessing citizen portal also see only citizen items
    return this.navigationItems;
  }
}
