import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Permission {
  id?: string;
  name: string;
  action: string;
  resource: string;
  description?: string;
  isActive: boolean;
}

export interface Role {
  id?: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;
  private userPermissionsSubject = new BehaviorSubject<Permission[]>([]);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ===== PERMISSIONS =====

  createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  getPermissionById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  updatePermission(id: string, permission: Permission): Observable<Permission> {
    return this.http.patch<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  deletePermission(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ===== ROLES =====

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  getRoleByName(name: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/name/${name}`);
  }

  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.patch<Role>(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }

  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<Role>(
      `${this.apiUrl}/roles/${roleId}/permissions`,
      { permissionIds }
    );
  }

  // ===== PERMISSION CHECKING =====

  hasPermission(action: string, resource: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.some(
      (p) => p.action === action && p.resource === resource
    );
  }

  hasAnyPermission(requiredPermissions: { action: string; resource: string }[]): boolean {
    const permissions = this.userPermissionsSubject.value;
    return requiredPermissions.some((req) =>
      permissions.some(
        (p) => p.action === req.action && p.resource === req.resource
      )
    );
  }

  hasAllPermissions(requiredPermissions: { action: string; resource: string }[]): boolean {
    const permissions = this.userPermissionsSubject.value;
    return requiredPermissions.every((req) =>
      permissions.some(
        (p) => p.action === req.action && p.resource === req.resource
      )
    );
  }

  setUserPermissions(permissions: Permission[]): void {
    this.userPermissionsSubject.next(permissions);
  }

  getUserPermissions(): Permission[] {
    return this.userPermissionsSubject.value;
  }

  /**
   * Fetch multiple permissions by their IDs
   * @param permissionIds Array of permission IDs to fetch
   * @returns Observable of Permission array
   */
  getPermissionsByIds(permissionIds: string[]): Observable<Permission[]> {
    if (!permissionIds || permissionIds.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    // Make a POST request with permission IDs in body
    return this.http.post<Permission[]>(`${this.apiUrl}/by-ids`, { ids: permissionIds });
  }

  /**
   * Fetch multiple permissions by their names (fallback method)
   * More reliable than fetching by IDs if IDs are orphaned
   * @param permissionNames Array of permission names to fetch
   * @returns Observable of Permission array
   */
  getPermissionsByNames(permissionNames: string[]): Observable<Permission[]> {
    if (!permissionNames || permissionNames.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    // Make a POST request with permission names in body
    return this.http.post<Permission[]>(`${this.apiUrl}/by-names`, { names: permissionNames });
  }

  seedDefaultPermissions(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }
}
