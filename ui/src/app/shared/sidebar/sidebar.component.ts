
import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { filter } from 'rxjs/operators';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  sidebarOpen = false;
  isMobile = false;
  userRole: string = '';
  currentRoute: string = '';

  navigationItems = [
    // Citizen Section
    {
      path: '/portal/realtimereport',
      label: 'Report Issue',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z',
      color: 'text-red-600 hover:text-red-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      requiredPermissions: ['view:issues'],
      section: 'citizen'
    },
    {
      path: '/portal/petition',
      label: 'Petitions',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-blue-600 hover:text-blue-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      requiredPermissions: ['view:petitions'],
      section: 'citizen'
    },
    {
      path: '/portal/proposal',
      label: 'Vote on Projects',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-green-600 hover:text-green-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      requiredPermissions: ['view:votes'],
      section: 'citizen'
    },
    {
      path: '/portal/streaminglive',
      label: 'Virtual Hall',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      color: 'text-purple-600 hover:text-purple-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      requiredPermissions: ['view:townhalls'],
      section: 'citizen'
    },
    {
      path: '/portal/blog',
      label: 'Blogs & News',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      color: 'text-orange-600 hover:text-orange-700',
      allowedRoles: ['citizen', 'admin', 'super_admin'],
      requiredPermissions: ['view:blogs'],
      section: 'citizen'
    },
    // Admin Section
    {
      path: '/dashboard/report-admin',
      label: 'Reports Admin',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-rose-600 hover:text-rose-700',
      allowedRoles: ['admin', 'super_admin'],
      requiredPermissions: ['read:issues', 'update:issues'],
      section: 'admin'
    },
    {
      path: '/dashboard/adminpetition',
      label: 'Petitions Admin',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'text-pink-600 hover:text-pink-700',
      allowedRoles: ['admin', 'super_admin'],
      requiredPermissions: ['read:petitions', 'update:petitions'],
      section: 'admin'
    },
    {
      path: '/dashboard/vote-create',
      label: 'Vote Create',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'text-indigo-600 hover:text-indigo-700',
      allowedRoles: ['admin', 'super_admin'],
      requiredPermissions: ['create:votes', 'read:votes'],
      section: 'admin'
    },
    {
      path: '/dashboard/virtual-create',
      label: 'Virtual Meet',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      color: 'text-blue-600 hover:text-blue-700',
      allowedRoles: ['admin', 'super_admin'],
      requiredPermissions: ['create:townhalls', 'read:townhalls'],
      section: 'admin'
    },
    {
      path: '/dashboard/usersreg',
      label: 'Users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      color: 'text-gray-600 hover:text-gray-700',
      allowedRoles: ['super_admin'],
      requiredPermissions: ['read:users', 'update:users', 'delete:users', 'manage:users'],
      section: 'admin'
    },
    {
      path: '/dashboard/blog_admin',
      label: 'Blogs',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      color: 'text-green-600 hover:text-green-700',
      allowedRoles: ['super_admin'],
      requiredPermissions: ['create:blogs', 'read:blogs', 'update:blogs', 'delete:blogs'],
      section: 'admin'
    },
    {
      path: '/dashboard/permissions',
      label: 'Permissions',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      color: 'text-purple-600 hover:text-purple-700',
      allowedRoles: ['super_admin'],
      requiredPermissions: [],
      section: 'admin'
    },

  ];

  currentTheme: Theme = 'light';

  constructor(
    private router: Router,
    private authService: AuthService,
    public themeService: ThemeService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef
  ) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Subscribe to role stream
    this.authService.getRoleStream().subscribe(role => {
      this.userRole = role ?? '';
      console.log('🔄 [SIDEBAR] Role updated:', this.userRole);
      this.cdr.markForCheck();
    });

    // Subscribe to permission changes to re-render sidebar items
    this.permissionService.userPermissions$.subscribe(permissions => {
      console.log('📋 [SIDEBAR] Permissions updated, re-rendering items:', permissions.length);
      console.log('📋 [SIDEBAR] Permission details:', permissions.map(p => `${p.action}:${p.resource}`));
      this.cdr.markForCheck();
    });

    // Subscribe to theme changes for future logic if needed
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      if (this.isMobile) {
        this.closeSidebar();
      }
    });

    this.currentRoute = this.router.url;
    
    // Log initial state
    console.log('🔧 [SIDEBAR] Initialized:', {
      userRole: this.userRole,
      citizenItems: this.getCitizenItems().length,
      adminItems: this.getAdminItems().length
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.sidebarOpen = true;
    } else {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  isActiveRoute(path: string): boolean {
    return this.currentRoute.includes(path);
  }

  hasCitizenAccess(): boolean {
    const hasCitizen = ['citizen', 'admin', 'super_admin'].includes(this.userRole);
    console.log('🔐 [SIDEBAR] hasCitizenAccess:', { userRole: this.userRole, result: hasCitizen });
    return hasCitizen;
  }

  hasAdminAccess(): boolean {
    const hasAdmin = ['admin', 'super_admin'].includes(this.userRole);
    console.log('🔐 [SIDEBAR] hasAdminAccess:', { userRole: this.userRole, result: hasAdmin });
    return hasAdmin;
  }

  getCitizenItems() {
    const items = this.navigationItems.filter(item => 
      item.section === 'citizen' && 
      item.allowedRoles.includes(this.userRole) &&
      this.hasRequiredPermissions(item.requiredPermissions)
    );
    console.log('📋 [SIDEBAR] getCitizenItems returned:', items.length, 'items');
    return items;
  }

  getAdminItems() {
    const items = this.navigationItems.filter(item => 
      item.section === 'admin' && 
      item.allowedRoles.includes(this.userRole) &&
      this.hasRequiredPermissions(item.requiredPermissions)
    );
    console.log('📋 [SIDEBAR] getAdminItems returned:', items.length, 'items');
    return items;
  }

  /**
   * Check if user has ALL required permissions
   * Returns true if user is Super Admin (bypass) or has all required permissions
   */
  hasRequiredPermissions(requiredPermissions: string[]): boolean {
    // Super Admin has access to everything
    if (this.userRole === 'super_admin') {
      console.log('✅ [SIDEBAR] Super Admin - granting access');
      return true;
    }

    // If no specific permissions required, grant access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('✅ [SIDEBAR] No permissions required - granting access');
      return true;
    }

    // Check if user has all required permissions
    const userPermissions = this.permissionService.getUserPermissions();
    const userPermissionStrings = userPermissions.map(p => `${p.action}:${p.resource}`);
    
    console.log('📋 [SIDEBAR] Checking permissions:', {
      role: this.userRole,
      required: requiredPermissions,
      userHas: userPermissionStrings,
      count: { required: requiredPermissions.length, user: userPermissionStrings.length }
    });

    const hasAllPermissions = requiredPermissions.every(requiredPerm =>
      userPermissionStrings.includes(requiredPerm)
    );
    
    console.log(hasAllPermissions ? '✅ [SIDEBAR] Has all required permissions' : '❌ [SIDEBAR] Missing some permissions');
    
    return hasAllPermissions;
  }
}
