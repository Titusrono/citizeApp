import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../../../core/services/permission.service';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-permissions-management-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions-management-list.component.html',
  styleUrls: ['./permissions-management-list.component.scss']
})
export class PermissionManagementListComponent implements OnInit {
  roles: any[] = [];
  allPermissions: any[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedRole: any = null;
  selectedPermissions: string[] = [];
  showAssignModal = false;

  constructor(
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.loading = true;
    this.permissionService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load roles: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.allPermissions = permissions;
      },
      error: (err) => {
        console.warn('Failed to load all permissions:', err);
      }
    });
  }

  openAssignModal(role: any): void {
    this.selectedRole = role;
    this.selectedPermissions = role.permissions?.map((p: any) => p.id) || [];
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedRole = null;
    this.selectedPermissions = [];
  }

  togglePermission(permissionId: string): void {
    const index = this.selectedPermissions.indexOf(permissionId);
    if (index > -1) {
      this.selectedPermissions.splice(index, 1);
    } else {
      this.selectedPermissions.push(permissionId);
    }
  }

  assignPermissions(): void {
    if (!this.selectedRole) return;

    this.loading = true;
    this.permissionService.assignPermissionsToRole(
      this.selectedRole.id,
      this.selectedPermissions
    ).subscribe({
      next: () => {
        this.successMessage = `Permissions assigned to ${this.selectedRole.name} successfully!`;
        this.loading = false;
        this.closeAssignModal();
        this.loadRoles();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to assign permissions: ' + (err.error?.message || 'Unknown error');
        this.loading = false;
        setTimeout(() => this.errorMessage = '', 4000);
      }
    });
  }

  getPermissionsByResource(resource: string): any[] {
    return this.allPermissions.filter(p => p.resource === resource);
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  getUniqueResources(): string[] {
    return [...new Set(this.allPermissions.map(p => p.resource))];
  }
}
