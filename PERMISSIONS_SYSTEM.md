# Permission System Documentation

## Overview
This is a granular permission-based access control system that allows controlling user actions at a fine-grained level. Instead of just checking roles, you can now specify exactly which actions a user can perform on which resources.

## How It Works

### Backend
1. **Permissions**: Define what actions can be performed on resources
   - Actions: CREATE, READ, UPDATE, DELETE, APPROVE, REJECT, PUBLISH, MANAGE
   - Resources: USERS, ISSUES, PETITIONS, BLOGS, VOTES, POLICIES, TOWNHALLS, REPORTS, SIGNATURES

2. **Roles**: Group permissions together
   - A role can have multiple permissions
   - Users are assigned roles
   - Permissions are inherited through roles

### Frontend
1. Use the `*appHasPermission` directive to show/hide elements based on permissions
2. Use `PermissionService` to check permissions programmatically

## Setup

### Step 1: Seed Default Permissions (Backend)
After the backend starts, send a POST request to seed default permissions:
```bash
POST http://localhost:3000/permissions/seed
Authorization: Bearer <super_admin_token>
```

### Step 2: Create Roles and Assign Permissions
Create roles with desired permissions:
```bash
POST http://localhost:3000/permissions/roles
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "name": "content-moderator",
  "description": "Can moderate blogs and petitions",
  "permissionIds": [
    "<permission-id-for-read:blogs>",
    "<permission-id-for-approve:blogs>",
    "<permission-id-for-read:petitions>",
    "<permission-id-for-approve:petitions>"
  ]
}
```

### Step 3: Load Permissions in Frontend
When a user logs in, load their permissions:

```typescript
// In auth.service.ts or auth.interceptor.ts
import { PermissionService, Permission } from './path-to-permission.service';

// After successful login
const userRole = this.getUserRoleFromToken();
this.permissionService.getRoleByName(userRole).subscribe((role) => {
  this.permissionService.setUserPermissions(role.permissions);
});
```

## Usage

### In Templates (HTML)

#### Single Permission Check
```html
<!-- Show button only if user can create issues -->
<button 
  *appHasPermission="{ action: 'create', resource: 'issues' }"
  (click)="createIssue()"
>
  Create Issue
</button>
```

#### Multiple Permissions (OR Logic - default)
```html
<!-- Show if user can either read OR approve blogs -->
<div 
  *appHasPermission="[
    { action: 'read', resource: 'blogs' },
    { action: 'approve', resource: 'blogs' }
  ]"
>
  Blog Management Panel
</div>
```

#### Multiple Permissions (AND Logic)
```html
<!-- Show only if user can BOTH read AND approve blogs -->
<div 
  *appHasPermission="[
    { action: 'read', resource: 'blogs' },
    { action: 'approve', resource: 'blogs' }
  ]"
  appHasPermissionOp="AND"
>
  Advanced Blog Moderation
</div>
```

### In Component TypeScript

```typescript
import { PermissionService } from './path-to-permission.service';

export class MyComponent {
  constructor(private permissionService: PermissionService) {}

  canCreateIssue(): boolean {
    return this.permissionService.hasPermission('create', 'issues');
  }

  canModerate(): boolean {
    const requiredPerms = [
      { action: 'approve', resource: 'issues' },
      { action: 'approve', resource: 'petitions' }
    ];
    return this.permissionService.hasAnyPermission(requiredPerms);
  }

  hasFullBlogControl(): boolean {
    const requiredPerms = [
      { action: 'create', resource: 'blogs' },
      { action: 'delete', resource: 'blogs' },
      { action: 'publish', resource: 'blogs' }
    ];
    return this.permissionService.hasAllPermissions(requiredPerms);
  }
}
```

## API Endpoints

### Permissions
- `POST /permissions` - Create permission (Super Admin only)
- `GET /permissions` - Get all permissions
- `GET /permissions/:id` - Get permission by ID
- `PATCH /permissions/:id` - Update permission (Super Admin only)
- `DELETE /permissions/:id` - Delete permission (Super Admin only)

### Roles
- `POST /permissions/roles` - Create role (Super Admin only)
- `GET /permissions/roles` - Get all roles
- `GET /permissions/roles/:id` - Get role by ID
- `GET /permissions/roles/name/:name` - Get role by name
- `PATCH /permissions/roles/:id` - Update role (Super Admin only)
- `DELETE /permissions/roles/:id` - Delete role (Super Admin only)
- `POST /permissions/roles/:id/permissions` - Assign permissions to role

### Utility
- `POST /permissions/seed` - Seed default permissions (Super Admin only)

## Database Schema

### Permissions Collection
```json
{
  "_id": "ObjectId",
  "name": "create:issues",
  "action": "create",
  "resource": "issues",
  "description": "Can create new issues",
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Roles Collection
```json
{
  "_id": "ObjectId",
  "name": "issue-reporter",
  "description": "Can report issues",
  "permissions": ["ObjectId", "ObjectId", ...],
  "isActive": true,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Example Workflow

1. Super admin seeds permissions via `/permissions/seed`
2. Super admin creates a "moderator" role with specific permissions
3. Admin assigns users to the "moderator" role
4. When users log in, their permissions are loaded from their role
5. Frontend uses permissions to show/hide buttons and manage access
6. Backend guards (using role-based guards) double-check permissions on API calls

## Best Practices

1. **Always seed default permissions** - Run once at setup
2. **Use the directive for UI hiding** - Prevents accidental clicks
3. **Always validate on backend** - Never trust frontend-only checks
4. **Principle of least privilege** - Give users only needed permissions
5. **Group permissions logically** - Use roles to group related permissions
6. **Document your permissions** - Add meaningful descriptions

## Migration from Role-Based to Permission-Based

If migrating from a pure role-based system:

1. Create corresponding roles in the new system
2. Map old role names to permission groups
3. Seed permissions and assign to roles
4. Update frontend to load permissions from roles
5. Add `*appHasPermission` directives to buttons
6. Keep role-based checks on backend (for now) alongside permission checks
7. Gradually migrate backend to use permission checks instead of role checks
