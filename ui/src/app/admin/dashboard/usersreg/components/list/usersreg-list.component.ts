import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersregService } from '../../services/usersreg.service';
import { UsersregFormComponent } from '../form/usersreg-form.component';
import { ConfirmDialogComponent } from '../../../../../shared/components';
import { PermissionService } from '../../../../../core/services/permission.service';
import { HasPermissionDirective } from '../../../../../shared/directives/has-permission.directive';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-usersreg-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UsersregFormComponent, ConfirmDialogComponent, HasPermissionDirective],
  templateUrl: './usersreg-list.component.html',
  styleUrls: ['./usersreg-list.component.scss']
})
export class UsersregListComponent implements OnInit {
  currentData: any = {
    email: '',
    username: '',
    phone_no: '',
    subCounty: '',
    ward: '',
    role: 'citizen'
  };

  itemsList: any[] = [];
  successMessage = '';
  errorMessage = '';
  editingUser: any = null;
  isEditing = false;
  showModal = false;

  // Permissions modal state
  showPermissionsModal = false;
  selectedUserForPermissions: any = null;
  allPermissions: any[] = [];
  userPermissions: string[] = [];
  permissionsLoading = false;
  permissionsLoadingError = '';
  permissionsModalLoading = false;

  // Delete confirmation dialog state
  showDeleteConfirm = false;
  userToDelete: any = null;
  isDeleting = false;

  subCounties: string[] = [
    'Kajiado North',
    'Kajiado South',
    'Kajiado East',
    'Kajiado West',
    'Kajiado Central'
  ];
  selectedSubCounty: string = '';
  subCountyStats: { subCounty: string; count: number; percentage: number }[] = [];

  constructor(
    private usersregService: UsersregService,
    public permissionService: PermissionService,
    private authService: AuthService
  ) {}

  isSuperAdmin(): boolean {
    const userRole = this.authService.getUserRole();
    return userRole === 'Super Admin' || userRole === 'super_admin';
  }

  ngOnInit(): void {
    this.fetchUsers();
    this.loadAllPermissions();
  }

  fetchUsers(): void {
    this.usersregService.getAllUsers().subscribe({
      next: (data: any[]) => {
        // Sort by createdAt descending (newest first - most recent at top)
        const sorted = [...data].sort((a, b) => {
          const getTime = (date: any) => {
            if (!date) return 0;
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };
          
          const dateA = getTime(a.createdAt);
          const dateB = getTime(b.createdAt);
          return dateB - dateA; // Descending: newest first
        });
        this.itemsList = sorted;
        this.calculateSubCountyStats();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to fetch users';
        console.error(err);
      }
    });
  }

  calculateSubCountyStats(): void {
    const total = this.itemsList.length;
    const counts: { [key: string]: number } = {};

    this.subCounties.forEach(sc => (counts[sc] = 0));

    this.itemsList.forEach(user => {
      const sc = user.subCounty;
      if (sc && counts.hasOwnProperty(sc)) {
        counts[sc]++;
      }
    });

    this.subCountyStats = this.subCounties.map(subCounty => {
      const count = counts[subCounty] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { subCounty, count, percentage };
    });
  }

  openModal(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onFormSubmit(userData: any): void {
    if (this.isEditing && this.editingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    // Create clean payload with ONLY valid DTO fields (whitelist approach)
    const createPayload = {
      email: this.currentData.email,
      username: this.currentData.username,
      phone_no: this.currentData.phone_no,
      subCounty: this.currentData.subCounty,
      ward: this.currentData.ward,
      role: this.currentData.role || 'citizen'
    };

    console.log('➕ Creating user with clean payload:', createPayload);

    this.usersregService.createUser(createPayload).subscribe({
      next: () => {
        this.successMessage = 'User created successfully!';
        this.errorMessage = '';
        this.closeModal();
        this.fetchUsers();
      },
      error: (err: any) => {
        console.error('❌ Create error:', err);
        this.errorMessage = 'Failed to create user: ' + (err.error?.message || err.message || 'Unknown error');
        this.successMessage = '';
      }
    });
  }

  updateUser(): void {
    if (!this.editingUser) return;

    // Create clean payload with ONLY valid DTO fields (whitelist approach)
    const updatePayload = {
      email: this.currentData.email,
      username: this.currentData.username,
      phone_no: this.currentData.phone_no,
      subCounty: this.currentData.subCounty,
      ward: this.currentData.ward,
      role: this.currentData.role
    };

    console.log('📝 Updating user with clean payload:', updatePayload);
    
    // Check if role is being changed
    const roleChanged = this.editingUser.role !== this.currentData.role;
    const currentUserEmail = this.authService.getUserEmail();
    const isCurrentUser = currentUserEmail === this.editingUser.email;

    this.usersregService.updateUser(this.editingUser.email, updatePayload).subscribe({
      next: (updatedUser: any) => {
        this.successMessage = 'User updated successfully!';
        this.errorMessage = '';
        
        // If this is the current user and role changed, refresh permissions from backend
        if (isCurrentUser && roleChanged) {
          console.log('🔄 [UPDATE-USER] Current user role changed from', this.editingUser.role, 'to', this.currentData.role);
          console.log('🔄 [UPDATE-USER] Fetching updated permissions for current user...');
          
          // Fetch the updated user to get their new permissions
          this.usersregService.getUserByEmail(currentUserEmail!).subscribe({
            next: (user: any) => {
              console.log('✅ [UPDATE-USER] Got updated user:', {
                email: user.email,
                role: user.role,
                permissionIds: user.permissionIds?.length || 0
              });
              
              if (user.permissionIds && user.permissionIds.length > 0) {
                console.log('📡 [UPDATE-USER] Fetching full permission objects for current user...');
                this.permissionService.getPermissionsByIds(user.permissionIds).subscribe({
                  next: (permissions: any[]) => {
                    console.log('✅ [UPDATE-USER] Updated permissions loaded:', permissions.map(p => `${p.action}:${p.resource}`));
                    this.permissionService.setUserPermissions(permissions);
                    console.log('✅ [UPDATE-USER] Sidebar will now update with new permissions');
                  },
                  error: (err) => {
                    console.error('❌ [UPDATE-USER] Failed to load permissions:', err);
                  }
                });
              }
            },
            error: (err) => {
              console.error('❌ [UPDATE-USER] Failed to fetch updated user:', err);
            }
          });
        }
        
        this.editingUser = null;
        this.isEditing = false;
        this.closeModal();
        this.fetchUsers();
      },
      error: (err: any) => {
        console.error('❌ Update error:', err);
        this.errorMessage = 'Failed to update user: ' + (err.error?.message || err.message || 'Unknown error');
        this.successMessage = '';
      }
    });
  }

  onEdit(user: any): void {
    this.editingUser = { ...user };
    this.currentData = { ...user };
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  openPermissionsModal(user: any): void {
    this.selectedUserForPermissions = user;
    // Load user's current permission IDs
    this.userPermissions = user.permissionIds ? [...user.permissionIds] : [];
    console.log('🔐 Opening permissions modal for user:', user.username);
    console.log('📋 Current permissions:', this.userPermissions);
    this.showPermissionsModal = true;
    this.permissionsLoadingError = '';
    
    // Load permissions if not already loaded
    if (this.allPermissions.length === 0) {
      this.permissionsModalLoading = true;
      this.loadAllPermissions();
    }
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.selectedUserForPermissions = null;
    this.userPermissions = [];
  }

  loadAllPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions: any[]) => {
        // Ensure we have valid permission objects with id, action, resource fields
        this.allPermissions = permissions.map(p => ({
          id: p.id || p._id,
          action: p.action,
          resource: p.resource,
          description: p.description,
          name: p.name
        }));
        console.log('✅ [MODAL] All permissions loaded:', this.allPermissions.length);
        console.log('📋 [MODAL] All Permissions:', this.allPermissions.map(p => `${p.action}:${p.resource}`));
        
        // Detailed classification logging
        const adminPerms: any[] = [];
        const citizenPerms: any[] = [];
        
        this.allPermissions.forEach(p => {
          const section = this.getPermissionSection(p);
          console.log(`🔍 [MODAL] ${p.action}:${p.resource} → ${section}`);
          if (section === 'admin') {
            adminPerms.push(p);
          } else {
            citizenPerms.push(p);
          }
        });
        
        console.log('👨‍💼 [MODAL] Admin permissions:', adminPerms.length);
        console.log('📝 [MODAL] Admin:', adminPerms.map(p => `${p.action}:${p.resource}`));
        
        console.log('👥 [MODAL] Citizen permissions:', citizenPerms.length);
        console.log('📝 [MODAL] Citizen:', citizenPerms.map(p => `${p.action}:${p.resource}`));
        
        // Log unique resources by section
        const adminResources = this.getUniqueResourcesForSection('admin');
        const citizenResources = this.getUniqueResourcesForSection('citizen');
        console.log('📊 [MODAL] Admin resources:', adminResources);
        console.log('📊 [MODAL] Citizen resources:', citizenResources);
        
        this.permissionsModalLoading = false;
        this.permissionsLoadingError = '';
      },
      error: (err: any) => {
        console.error('❌ [MODAL] Failed to load permissions:', err);
        this.permissionsLoadingError = 'Failed to load permissions. Please try again.';
        this.permissionsModalLoading = false;
      }
    });
  }

  togglePermission(permissionId: string): void {
    const index = this.userPermissions.indexOf(permissionId);
    if (index > -1) {
      this.userPermissions.splice(index, 1);
    } else {
      this.userPermissions.push(permissionId);
    }
  }

  selectAllPermissions(): void {
    this.userPermissions = this.allPermissions.map(p => p.id);
    console.log('✅ All permissions selected:', this.userPermissions);
  }

  deselectAllPermissions(): void {
    this.userPermissions = [];
    console.log('✅ All permissions deselected');
  }

  toggleAllPermissions(): void {
    if (this.userPermissions.length === this.allPermissions.length) {
      this.deselectAllPermissions();
    } else {
      this.selectAllPermissions();
    }
  }

  /**
   * Get ALL permissions for a specific resource (works for BOTH admin and citizen)
   * Example: getPermissionsByResource('issues') returns:
   *   - create:issues (admin action)
   *   - read:issues (citizen action)
   *   - update:issues (admin action)
   *   - delete:issues (admin action)
   *   - approve:issues (admin action)
   * 
   * This method is resource-agnostic and works for any permission action.
   */
  getPermissionsByResource(resource: string): any[] {
    return this.allPermissions.filter(p => p.resource === resource);
  }

  /**
   * Select ALL permissions for a resource (both admin and citizen actions)
   * Used by the resource checkbox to select all actions for that resource
   */
  selectResourcePermissions(resource: string): void {
    const resourcePermissions = this.getPermissionsByResource(resource);
    const permissionIds = resourcePermissions.map(p => p.id);
    
    permissionIds.forEach(id => {
      if (!this.userPermissions.includes(id)) {
        this.userPermissions.push(id);
      }
    });
    
    console.log(`✅ All ${resource} permissions selected (admin + citizen):`, permissionIds);
  }

  /**
   * Deselect ALL permissions for a resource (both admin and citizen actions)
   */
  deselectResourcePermissions(resource: string): void {
    const resourcePermissions = this.getPermissionsByResource(resource);
    const permissionIds = resourcePermissions.map(p => p.id);
    
    this.userPermissions = this.userPermissions.filter(
      id => !permissionIds.includes(id)
    );
    
    console.log(`✅ All ${resource} permissions deselected (admin + citizen):`, permissionIds);
  }

  /**
   * Toggle ALL permissions for a resource (both admin and citizen actions)
   * If ALL are selected → deselect all
   * If SOME or NONE are selected → select all
   */
  toggleResourcePermissions(resource: string): void {
    const resourcePermissions = this.getPermissionsByResource(resource);
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    
    // Check if all permissions for this resource are selected
    const allSelected = resourcePermissionIds.every(id => 
      this.userPermissions.includes(id)
    );
    
    if (allSelected) {
      this.deselectResourcePermissions(resource);
    } else {
      this.selectResourcePermissions(resource);
    }
  }

  /**
   * Check if ALL permissions for a resource are selected (admin + citizen)
   */
  isResourceFullySelected(resource: string): boolean {
    const resourcePermissions = this.getPermissionsByResource(resource);
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    
    return resourcePermissionIds.length > 0 && 
           resourcePermissionIds.every(id => this.userPermissions.includes(id));
  }

  /**
   * Check if SOME (but not all) permissions for a resource are selected
   * This is used to show the "indeterminate" checkbox state
   */
  isResourcePartiallySelected(resource: string): boolean {
    const resourcePermissions = this.getPermissionsByResource(resource);
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    
    const selectedCount = resourcePermissionIds.filter(id => 
      this.userPermissions.includes(id)
    ).length;
    
    return selectedCount > 0 && selectedCount < resourcePermissionIds.length;
  }

  saveUserPermissions(): void {
    if (!this.selectedUserForPermissions) return;

    this.permissionsLoading = true;
    console.log(`💾 Saving ${this.userPermissions.length} permissions for user: ${this.selectedUserForPermissions.email}`);
    
    this.usersregService.updateUserPermissions(this.selectedUserForPermissions.email, this.userPermissions).subscribe({
      next: (updatedUser: any) => {
        console.log('✅ Permissions saved successfully:', updatedUser);
        this.successMessage = `Permissions assigned to ${this.selectedUserForPermissions.username} successfully!`;
        this.permissionsLoading = false;
        
        // Check if the current user's permissions were updated
        const currentUserEmail = this.authService.getUserEmail();
        if (currentUserEmail === this.selectedUserForPermissions.email) {
          console.log('🔄 [PERMISSIONS-MODAL] Current user permissions updated - refreshing sidebar immediately...');
          
          // Get full permission objects for the updated permissions
          const permissionIds = this.userPermissions;
          
          if (permissionIds && permissionIds.length > 0) {
            console.log('📡 [PERMISSIONS-MODAL] Fetching full permission objects for IDs:', permissionIds);
            this.permissionService.getPermissionsByIds(permissionIds).subscribe({
              next: (permissions: any[]) => {
                console.log('✅ [PERMISSIONS-MODAL] Updated permissions loaded for current user:', permissions.map(p => `${p.action}:${p.resource}`));
                this.permissionService.setUserPermissions(permissions);
                console.log('✅ [PERMISSIONS-MODAL] Permissions updated in service - sidebar should now show new items');
              },
              error: (err) => {
                console.error('❌ [PERMISSIONS-MODAL] Failed to refresh permissions for current user:', err);
                // Fallback: show message and ask user to refresh
                this.errorMessage = 'Permissions saved but please refresh the page to see changes';
              }
            });
          } else {
            console.log('⚠️ [PERMISSIONS-MODAL] No permissions to set - clearing sidebar');
            this.permissionService.setUserPermissions([]);
          }
        }
        
        this.closePermissionsModal();
        this.fetchUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        console.error('❌ Failed to save permissions:', err);
        this.errorMessage = 'Failed to assign permissions: ' + (err.error?.message || err.message || 'Unknown error');
        this.permissionsLoading = false;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.userPermissions.includes(permissionId);
  }

  getUniqueResources(): string[] {
    return [...new Set(this.allPermissions.map(p => p.resource))];
  }

  /**
   * Get section label for display
   */
  getSectionLabel(section: string): string {
    return section === 'admin' ? '👨‍💼 Admin Permissions' : '👥 Citizen Permissions';
  }

  /**
   * ===== PERMISSION CLASSIFICATION (Display Organization) =====
   * These methods organize permissions into sections for display:
   * - ADMIN SECTION: create, update, delete, manage, approve, publish actions
   * - CITIZEN SECTION: read, view, vote, comment actions
   * 
   * This is purely for UI organization. The underlying permission data contains BOTH types.
   */

  /**
   * Get the actual section for a specific permission based on its ACTION
   * read:issues → citizen
   * create:issues → admin
   * read:blogs → citizen
   * publish:blogs → admin
   */
  getPermissionSection(permission: any): string {
    const citizenActions = ['view', 'vote', 'comment'];
    const adminActions = ['create', 'read', 'update', 'delete', 'manage', 'approve', 'publish', 'reject'];
    
    if (citizenActions.includes(permission.action)) {
      return 'citizen';
    } else if (adminActions.includes(permission.action)) {
      return 'admin';
    }
    
    // Default to admin for unknown actions
    return 'admin';
  }

  /**
   * Get permissions for a specific section
   * 
   * SECTION MAPPING (Based on Sidebar):
   * 
   * CITIZEN SECTION (view-only access):
   *   - view:issues → Report Issue
   *   - view:petitions → Petitions
   *   - view:votes → Vote on Projects
   *   - view:townhalls → Virtual Hall
   *   - view:blogs → Blogs & News
   * 
   * ADMIN SECTION (manage/create access):
   *   - read:issues, update:issues → Reports Admin
   *   - read:petitions, update:petitions → Petitions Admin
   *   - create:votes, read:votes → Vote Create
   *   - create:townhalls, read:townhalls → Virtual Meet
   *   - read:users, update:users, delete:users, manage:users → Users
   *   - create:blogs, read:blogs, update:blogs, delete:blogs → Blogs
   *   - read:permissions, create:permissions, update:permissions → Permissions
   * 
   * NO OVERLAP: 'view' is distinct from 'read' to avoid conflicts
   */
  getPermissionsBySection(section: string): any[] {
    return this.allPermissions.filter(p => this.getPermissionSection(p) === section);
  }

  /**
   * Get unique sections in order (admin first, then citizen)
   * Used to render section headers and containers in the modal
   */
  getUniqueSections(): string[] {
    const sections = new Set<string>();
    this.allPermissions.forEach(p => {
      sections.add(this.getPermissionSection(p));
    });
    // Return in order: admin first, citizen second
    return Array.from(sections).sort((a, b) => a === 'admin' ? -1 : 1);
  }

  /**
   * Get unique resources for a section
   * Example: For 'admin' section → [users, issues, petitions, blogs, votes, policies, townhalls]
   * Example: For 'citizen' section → [issues, petitions, blogs, votes, townhalls, policies, reports]
   * 
   * Used to render resource checkboxes within each section
   */
  getUniqueResourcesForSection(section: string): string[] {
    return [...new Set(
      this.getPermissionsBySection(section).map(p => p.resource)
    )];
  }

  onDelete(email: string): void {
    this.userToDelete = { email };
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed(): void {
    const email = this.userToDelete.email;
    this.isDeleting = true;

    this.usersregService.deleteUser(email).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully!';
        this.errorMessage = '';
        this.showDeleteConfirm = false;
        this.userToDelete = null;
        this.isDeleting = false;
        this.fetchUsers();
      },
      error: () => {
        this.errorMessage = 'Failed to delete user.';
        this.successMessage = '';
        this.isDeleting = false;
      }
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm = false;
    this.userToDelete = null;
  }

  resetForm(): void {
    this.currentData = {
      email: '',
      username: '',
      phone_no: '',
      subCounty: '',
      ward: '',
      role: 'citizen'
    };
    this.isEditing = false;
    this.editingUser = null;
    this.errorMessage = '';
  }

  applySubCountyFilter(): void {
    if (!this.selectedSubCounty) {
      this.fetchUsers();
    } else {
      this.usersregService.getAllUsers().subscribe({
        next: (data: any[]) => {
          this.itemsList = data.filter(user =>
            user.subCounty?.toLowerCase() === this.selectedSubCounty.toLowerCase()
          );
        },
        error: (err) => {
          this.errorMessage = 'Failed to filter users';
        }
      });
    }
  }
}
