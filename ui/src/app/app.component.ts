import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { AuthService } from './core/auth/auth.service';
import { PermissionService } from './core/services/permission.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'citizenConnectFrontend';
  showFooter = true;
  showHeader = true;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {
    // Initialize theme service (constructor will handle initialization)
  }

  ngOnInit() {
    // Load user-specific permissions on app initialization if logged in
    const userRole = this.authService.getUserRole();
    if (userRole) {
      const currentPermissions = this.permissionService.getUserPermissions();
      // Only load if not already loaded
      if (currentPermissions.length === 0) {
        this.loadUserPermissions();
      }
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const isAuthenticatedRoute = url.startsWith('/portal') || url.startsWith('/dashboard');
        this.showFooter = !isAuthenticatedRoute;
        this.showHeader = !isAuthenticatedRoute;
      });
  }

  /**
   * Fetch current user permissions from backend
   * First gets the user object with permissionIds
   * Then fetches the full permission objects for those IDs
   */
  private loadUserPermissions(): void {
    console.log('🔄 [APP] Starting permission load cycle...');
    
    // Step 1: Get current user with their permission IDs
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        console.log('👤 [APP] Current user loaded:', user.email);
        console.log('🔐 [APP] User permission IDs:', user.permissionIds);
        console.log('📊 [APP] Permission count:', user.permissionIds?.length || 0);
        console.log('🎭 [APP] User role:', user.role);

        // Step 2: If user has permissions, fetch the full permission objects
        if (user.permissionIds && user.permissionIds.length > 0) {
          console.log('📡 [APP] Fetching full permission objects for IDs:', user.permissionIds);
          this.permissionService.getPermissionsByIds(user.permissionIds).subscribe({
            next: (permissions) => {
              console.log('✅ [APP] User permissions loaded successfully:', permissions);
              console.log('📝 [APP] Permissions:', permissions.map(p => `${p.action}:${p.resource}`));
              this.permissionService.setUserPermissions(permissions);
              console.log('💾 [APP] Permissions stored in PermissionService');
            },
            error: (err) => {
              console.error('❌ [APP] Failed to load user permissions:', err);
              console.warn('⚠️  [APP] Falling back to role-based permissions for role:', user.role);
              // Fall back to role-based permissions if individual permission fetch fails
              this.loadRolePermissions(user.role);
            }
          });
        } else {
          console.log('ℹ️  [APP] User has no specific permissions, using role defaults');
          // No specific permissions, use role defaults
          this.loadRolePermissions(user.role);
        }
      },
      error: (err) => {
        console.error('⚠️  [APP] Failed to get current user:', err);
        // Fall back to role-based permissions
        const userRole = this.authService.getUserRole();
        if (userRole) {
          this.loadRolePermissions(userRole);
        }
      }
    });
  }

  /**
   * Fallback: Load role-based permissions
   * Used when user-specific permissions are not available
   */
  private loadRolePermissions(userRole: string): void {
    if (!userRole) return;

    console.log('📚 [APP] Loading role-based permissions for role:', userRole);
    this.authService.getRolePermissions(userRole).subscribe({
      next: (roleData: any) => {
        if (roleData?.permissions) {
          console.log('📋 [APP] Role permissions loaded:', roleData.permissions);
          console.log('📝 [APP] Permissions:', roleData.permissions.map((p: any) => `${p.action}:${p.resource}`));
          this.permissionService.setUserPermissions(roleData.permissions);
          console.log('💾 [APP] Role permissions stored in PermissionService');
        }
      },
      error: (err) => {
        console.warn('⚠️  [APP] Failed to load role permissions:', err);
      }
    });
  }
}
