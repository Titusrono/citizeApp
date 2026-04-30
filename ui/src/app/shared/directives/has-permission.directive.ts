import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../core/auth/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: { action: string; resource: string } | { action: string; resource: string }[] = [];
  @Input() appHasPermissionOp: 'AND' | 'OR' = 'OR'; // Default to OR logic

  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    const hasPermission = this.checkPermission();
    if (hasPermission) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private checkPermission(): boolean {
    if (!this.appHasPermission) {
      return false;
    }

    // Admins bypass permission checks
    const userRole = this.authService.getUserRole();
    if (userRole === 'admin' || userRole === 'super_admin') {
      return true;
    }

    const permissions = Array.isArray(this.appHasPermission)
      ? this.appHasPermission
      : [this.appHasPermission];

    if (this.appHasPermissionOp === 'AND') {
      return this.permissionService.hasAllPermissions(permissions);
    } else {
      return this.permissionService.hasAnyPermission(permissions);
    }
  }
}
