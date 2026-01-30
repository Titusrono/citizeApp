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
    // Citizen Section
    {
      path: 'realtimereport',
      label: 'Report Issue',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z',
      color: 'text-red-600 hover:text-red-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      section: 'citizen'
    },
    {
      path: 'petition',
      label: 'Petitions',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-blue-600 hover:text-blue-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      section: 'citizen'
    },
    {
      path: 'proposal',
      label: 'Vote on Projects',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-green-600 hover:text-green-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      section: 'citizen'
    },
    {
      path: 'streaminglive',
      label: 'Virtual Hall',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      color: 'text-purple-600 hover:text-purple-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      section: 'citizen'
    },
    // Admin Section
    {
      path: '/dashboard/report-admin',
      label: 'Reports Admin',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-rose-600 hover:text-rose-700',
      allowedRoles: ['admin', 'super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/adminpetition',
      label: 'Petitions Admin',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-pink-600 hover:text-pink-700',
      allowedRoles: ['admin', 'super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/vote-create',
      label: 'Vote Create',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-indigo-600 hover:text-indigo-700',
      allowedRoles: ['admin', 'super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/virtual-create',
      label: 'Virtual Meet',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      color: 'text-blue-600 hover:text-blue-700',
      allowedRoles: ['admin', 'super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/usersreg',
      label: 'Users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'text-gray-600 hover:text-gray-700',
      allowedRoles: ['super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/blog_admin',
      label: 'Blogs',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      color: 'text-green-600 hover:text-green-700',
      allowedRoles: ['super_admin'],
      section: 'admin'
    },
    {
      path: '/dashboard/moderator',
      label: 'Moderator',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      color: 'text-purple-600 hover:text-purple-700',
      allowedRoles: ['admin', 'super_admin'],
      section: 'admin'
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

  canAccessRoute(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.userRole);
  }

  getVisibleNavigationItems() {
    return this.navigationItems.filter(item => this.canAccessRoute(item.allowedRoles));
  }

  getCitizenItems() {
    return this.getVisibleNavigationItems().filter(item => item.section === 'citizen');
  }

  getAdminItems() {
    return this.getVisibleNavigationItems().filter(item => item.section === 'admin');
  }

  hasCitizenAccess(): boolean {
    return this.getCitizenItems().length > 0;
  }

  hasAdminAccess(): boolean {
    return this.getAdminItems().length > 0;
  }
}
