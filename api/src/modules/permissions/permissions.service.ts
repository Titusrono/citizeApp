import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, ActionType, ResourceType } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { CreatePermissionDto, UpdatePermissionDto, CreateRoleDto, UpdateRoleDto } from './dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  // ===== PERMISSIONS =====

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const name = `${createPermissionDto.action}:${createPermissionDto.resource}`;
    
    const existingPermission = await this.permissionsRepository.findOne({
      where: { name }
    });
    
    if (existingPermission) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionsRepository.create({
      ...createPermissionDto,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.permissionsRepository.save(permission);
  }

  async getAllPermissions() {
    return this.permissionsRepository.find();
  }

  async getPermissionById(id: string) {
    const objectId = this.convertToObjectId(id);
    return this.permissionsRepository.findOne({
      where: { id: objectId }
    });
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const objectId = this.convertToObjectId(id);
    const permission = await this.getPermissionById(id);
    
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }

    if (updatePermissionDto.action || updatePermissionDto.resource) {
      const action = updatePermissionDto.action || permission.action;
      const resource = updatePermissionDto.resource || permission.resource;
      permission.name = `${action}:${resource}`;
    }

    Object.assign(permission, {
      ...updatePermissionDto,
      updatedAt: new Date(),
    });

    return this.permissionsRepository.save(permission);
  }

  async deletePermission(id: string) {
    const permission = await this.getPermissionById(id);
    if (!permission) {
      throw new BadRequestException('Permission not found');
    }
    return this.permissionsRepository.remove(permission);
  }

  /**
   * Fetch multiple permissions by their IDs
   * Used by frontend to load user-specific permissions
   */
  async getPermissionsByIds(ids: string[]) {
    console.log('🔍 [PERMISSIONS-SERVICE] getPermissionsByIds called with IDs:', ids);
    
    if (!ids || ids.length === 0) {
      console.log('⚠️ [PERMISSIONS-SERVICE] No IDs provided');
      return [];
    }

    try {
      const objectIds = ids.map(id => {
        console.log(`  Converting ID: ${id}`);
        return this.convertToObjectId(id);
      });
      
      console.log('🔄 [PERMISSIONS-SERVICE] Querying database with', objectIds.length, 'ObjectIds');
      
      // Use direct database query with MongoDB-style $in operator
      // Build the query condition to match any of the IDs
      const query = {
        _id: { $in: objectIds }
      };
      
      console.log('📝 [PERMISSIONS-SERVICE] Query:', JSON.stringify(query, (key, value) => {
        if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
          return value.toString();
        }
        return value;
      }));
      
      const permissions = await this.permissionsRepository.find({
        where: query as any
      });
      
      console.log('✅ [PERMISSIONS-SERVICE] Found', permissions.length, 'permissions');
      if (permissions.length > 0) {
        console.log('📋 [PERMISSIONS-SERVICE] Permissions found:');
        permissions.forEach(p => {
          console.log(`  - ${p.action}:${p.resource} (ID: ${p.id})`);
        });
      }
      
      return permissions;
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PERMISSIONS-SERVICE] Error fetching permissions by IDs:', {
        message: errorObj.message,
        stack: errorObj.stack,
        ids: ids
      });
      throw new BadRequestException('Failed to fetch permissions');
    }
  }

  /**
   * Get permissions by names (more reliable than by IDs)
   * Used as fallback when permission IDs are not found
   */
  async getPermissionsByNames(names: string[]): Promise<Permission[]> {
    console.log('🔍 [PERMISSIONS-SERVICE] getPermissionsByNames called with names:', names);
    
    if (!names || names.length === 0) {
      console.log('⚠️ [PERMISSIONS-SERVICE] No permission names provided');
      return [];
    }

    try {
      console.log('🔄 [PERMISSIONS-SERVICE] Querying database with', names.length, 'permission names');
      
      // Build MongoDB query to match any of the names
      const query = {
        name: { $in: names }
      };
      
      console.log('📝 [PERMISSIONS-SERVICE] Query:', JSON.stringify(query));
      
      const permissions = await this.permissionsRepository.find({
        where: query as any
      });
      
      console.log('✅ [PERMISSIONS-SERVICE] Found', permissions.length, 'permissions by name');
      if (permissions.length > 0) {
        console.log('📋 [PERMISSIONS-SERVICE] Permissions found:');
        permissions.forEach(p => {
          console.log(`  - ${p.name} (ID: ${p.id})`);
        });
      }
      
      return permissions;
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      console.error('❌ [PERMISSIONS-SERVICE] Error fetching permissions by names:', {
        message: errorObj.message,
        stack: errorObj.stack,
        names: names
      });
      return [];
    }
  }

  // ===== ROLES =====

  async createRole(createRoleDto: CreateRoleDto) {
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name }
    });
    
    if (existingRole) {
      throw new BadRequestException('Role already exists');
    }

    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const foundPermissions = await Promise.all(
        createRoleDto.permissionIds.map(id => this.getPermissionById(id))
      );
      const invalidPermissions = foundPermissions.filter(p => p === null || p === undefined);
      if (invalidPermissions.length > 0) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
      permissions = foundPermissions.filter((p): p is Permission => p !== null && p !== undefined);
    }

    const role = this.rolesRepository.create({
      name: createRoleDto.name,
      description: createRoleDto.description,
      permissions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.rolesRepository.save(role);
  }

  async getAllRoles() {
    return this.rolesRepository.find({ relations: ['permissions'] });
  }

  async getRoleById(id: string) {
    const objectId = this.convertToObjectId(id);
    return this.rolesRepository.findOne({
      where: { id: objectId },
      relations: ['permissions']
    });
  }

  async getRoleByName(name: string) {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ['permissions']
    });
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.getRoleById(id);
    
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name }
      });
      if (existingRole) {
        throw new BadRequestException('Role name already exists');
      }
    }

    if (updateRoleDto.permissionIds && updateRoleDto.permissionIds.length > 0) {
      const foundPermissions = await Promise.all(
        updateRoleDto.permissionIds.map(id => this.getPermissionById(id))
      );
      const invalidPermissions = foundPermissions.filter(p => p === null || p === undefined);
      if (invalidPermissions.length > 0) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
      role.permissions = foundPermissions.filter((p): p is Permission => p !== null && p !== undefined);
    }

    Object.assign(role, {
      ...updateRoleDto,
      updatedAt: new Date(),
    });

    return this.rolesRepository.save(role);
  }

  async deleteRole(id: string) {
    const role = await this.getRoleById(id);
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return this.rolesRepository.remove(role);
  }

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const foundPermissions = await Promise.all(
      permissionIds.map(id => this.getPermissionById(id))
    );

    const invalidPermissions = foundPermissions.filter(p => p === null || p === undefined);
    if (invalidPermissions.length > 0) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    role.permissions = foundPermissions.filter((p): p is Permission => p !== null && p !== undefined);
    role.updatedAt = new Date();

    return this.rolesRepository.save(role);
  }

  // Seed default permissions
  async seedDefaultPermissions() {
    const permissions: CreatePermissionDto[] = [
      // ===== USERS (Admin Only) =====
      { action: ActionType.CREATE, resource: ResourceType.USERS },
      { action: ActionType.READ, resource: ResourceType.USERS },
      { action: ActionType.UPDATE, resource: ResourceType.USERS },
      { action: ActionType.DELETE, resource: ResourceType.USERS },
      { action: ActionType.MANAGE, resource: ResourceType.USERS },

      // ===== ISSUES (Citizen View + Admin Manage) =====
      { action: ActionType.VIEW, resource: ResourceType.ISSUES },     // Citizen: Report Issue
      { action: ActionType.CREATE, resource: ResourceType.ISSUES },   // Admin: Create
      { action: ActionType.READ, resource: ResourceType.ISSUES },     // Admin: Read/View
      { action: ActionType.UPDATE, resource: ResourceType.ISSUES },   // Admin: Update
      { action: ActionType.DELETE, resource: ResourceType.ISSUES },   // Admin: Delete
      { action: ActionType.APPROVE, resource: ResourceType.ISSUES },  // Admin: Approve

      // ===== PETITIONS (Citizen View + Admin Manage) =====
      { action: ActionType.VIEW, resource: ResourceType.PETITIONS },    // Citizen: Petitions
      { action: ActionType.CREATE, resource: ResourceType.PETITIONS },  // Admin: Create
      { action: ActionType.READ, resource: ResourceType.PETITIONS },    // Admin: Read
      { action: ActionType.UPDATE, resource: ResourceType.PETITIONS },  // Admin: Update
      { action: ActionType.DELETE, resource: ResourceType.PETITIONS },  // Admin: Delete
      { action: ActionType.APPROVE, resource: ResourceType.PETITIONS }, // Admin: Approve

      // ===== BLOGS (Citizen View + Admin Manage) =====
      { action: ActionType.VIEW, resource: ResourceType.BLOGS },     // Citizen: Blogs & News
      { action: ActionType.CREATE, resource: ResourceType.BLOGS },   // Admin: Create
      { action: ActionType.READ, resource: ResourceType.BLOGS },     // Admin: Read
      { action: ActionType.UPDATE, resource: ResourceType.BLOGS },   // Admin: Update
      { action: ActionType.DELETE, resource: ResourceType.BLOGS },   // Admin: Delete
      { action: ActionType.PUBLISH, resource: ResourceType.BLOGS },  // Admin: Publish

      // ===== VOTES (Citizen View + Admin Create) =====
      { action: ActionType.VIEW, resource: ResourceType.VOTES },    // Citizen: Vote on Projects
      { action: ActionType.CREATE, resource: ResourceType.VOTES },  // Admin: Vote Create
      { action: ActionType.READ, resource: ResourceType.VOTES },    // Admin: Read
      { action: ActionType.MANAGE, resource: ResourceType.VOTES },  // Admin: Manage

      // ===== TOWNHALLS (Citizen View + Admin Create) =====
      { action: ActionType.VIEW, resource: ResourceType.TOWNHALLS },    // Citizen: Virtual Hall
      { action: ActionType.CREATE, resource: ResourceType.TOWNHALLS },  // Admin: Virtual Meet
      { action: ActionType.READ, resource: ResourceType.TOWNHALLS },    // Admin: Read
      { action: ActionType.UPDATE, resource: ResourceType.TOWNHALLS },  // Admin: Update
      { action: ActionType.DELETE, resource: ResourceType.TOWNHALLS },  // Admin: Delete

      // ===== POLICIES (Admin Only) =====
      { action: ActionType.CREATE, resource: ResourceType.POLICIES },
      { action: ActionType.READ, resource: ResourceType.POLICIES },
      { action: ActionType.UPDATE, resource: ResourceType.POLICIES },
      { action: ActionType.DELETE, resource: ResourceType.POLICIES },

      // ===== REPORTS (Admin Only) =====
      { action: ActionType.CREATE, resource: ResourceType.REPORTS },
      { action: ActionType.READ, resource: ResourceType.REPORTS },
      { action: ActionType.DELETE, resource: ResourceType.REPORTS },

      // ===== SIGNATURES (Citizen Only) =====
      // For petitions - citizens can sign
      { action: ActionType.CREATE, resource: ResourceType.SIGNATURES },
    ];

    console.log('🌱 [SEED] Starting permission seed with', permissions.length, 'permissions');
    let createdCount = 0;
    let existingCount = 0;

    for (const permDto of permissions) {
      const exists = await this.permissionsRepository.findOne({
        where: { name: `${permDto.action}:${permDto.resource}` }
      });
      
      if (!exists) {
        await this.createPermission(permDto);
        createdCount++;
        console.log(`✅ Created: ${permDto.action}:${permDto.resource}`);
      } else {
        existingCount++;
      }
    }
    
    console.log(`🌱 [SEED] Complete: ${createdCount} created, ${existingCount} already existed`);
  }

  /**
   * Get default permissions for a role
   * Called during user registration to assign initial permissions
   * 
   * CITIZEN: view:issues, view:petitions, view:votes, view:townhalls, view:blogs
   * WARD_MANAGER: read:issues, read:petitions, read:votes, read:townhalls, read:blogs, update:issues
   * etc.
   */
  async getDefaultPermissionsForRole(role: string) {
    // Special case: Super admin gets ALL permissions from the database
    if (role === 'super_admin') {
      console.log(`🔐 [REGISTRATION] Super admin detected - fetching ALL permissions`);
      try {
        const allPermissions = await this.permissionsRepository.find();
        const allPermissionIds = allPermissions.map(p => p.id.toString());
        console.log(`✅ [REGISTRATION] Assigned ${allPermissionIds.length} permissions to super_admin`);
        return allPermissionIds;
      } catch (err) {
        console.error('❌ [REGISTRATION] Error fetching all permissions for super_admin:', err instanceof Error ? err.message : String(err));
        return [];
      }
    }

    const defaultPermissionNames: Record<string, string[]> = {
      citizen: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
      ],
      ward_manager: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
        'read:issues',
        'update:issues',
        'read:petitions',
        'update:petitions',
      ],
      constituency_manager: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
        'read:issues',
        'update:issues',
        'read:petitions',
        'update:petitions',
        'read:votes',
        'read:townhalls',
        'read:blogs',
      ],
      admin: [
        'read:issues',
        'update:issues',
        'approve:issues',
        'read:petitions',
        'update:petitions',
        'approve:petitions',
        'create:votes',
        'read:votes',
        'create:townhalls',
        'read:townhalls',
        'create:blogs',
        'read:blogs',
        'update:blogs',
        'delete:blogs',
      ],
    };

    const permissionNames = defaultPermissionNames[role] || [];
    if (permissionNames.length === 0) {
      console.log(`⚠️ [REGISTRATION] No default permissions for role: ${role}`);
      return [];
    }

    console.log(`🔐 [REGISTRATION] Looking for ${permissionNames.length} permissions for role: ${role}`);
    console.log(`🔐 [REGISTRATION] Permission names to find:`, permissionNames);

    // Get permission objects by name - fetch each one individually for reliability
    const permissionIds: string[] = [];
    let foundCount = 0;
    let notFoundCount = 0;

    for (const permName of permissionNames) {
      try {
        const permission = await this.permissionsRepository.findOne({
          where: { name: permName }
        });
        
        if (permission) {
          permissionIds.push(permission.id.toString());
          foundCount++;
          console.log(`✅ [REGISTRATION] Found: ${permName} → ID: ${permission.id}`);
        } else {
          notFoundCount++;
          console.warn(`❌ [REGISTRATION] NOT FOUND: ${permName}`);
        }
      } catch (err: unknown) {
        notFoundCount++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`❌ [REGISTRATION] ERROR finding ${permName}:`, errorMsg);
      }
    }

    console.log(`🔐 [REGISTRATION] Summary for role ${role}: ${foundCount} found, ${notFoundCount} not found`);
    console.log(`🔐 [REGISTRATION] Returning ${permissionIds.length} permission IDs:`, permissionIds);
    return permissionIds;
  }

  /**
   * Get default permission NAMES for a role (for storing in user document)
   * More reliable than storing IDs which can become orphaned
   */
  async getDefaultPermissionNamesForRole(role: string): Promise<string[]> {
    const defaultPermissionNames: Record<string, string[]> = {
      citizen: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
      ],
      ward_manager: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
        'read:issues',
        'update:issues',
        'read:petitions',
        'update:petitions',
      ],
      constituency_manager: [
        'view:issues',
        'view:petitions',
        'view:votes',
        'view:townhalls',
        'view:blogs',
        'read:issues',
        'update:issues',
        'read:petitions',
        'update:petitions',
        'read:votes',
        'read:townhalls',
        'read:blogs',
      ],
      admin: [
        'read:issues',
        'update:issues',
        'approve:issues',
        'read:petitions',
        'update:petitions',
        'approve:petitions',
        'create:votes',
        'read:votes',
        'create:townhalls',
        'read:townhalls',
        'create:blogs',
        'read:blogs',
        'update:blogs',
        'delete:blogs',
      ],
    };

    if (role === 'super_admin') {
      console.log(`🔐 [REGISTRATION] Super admin - fetching ALL permission names`);
      try {
        const allPermissions = await this.permissionsRepository.find();
        const allNames = allPermissions.map(p => p.name);
        console.log(`✅ [REGISTRATION] Assigned ${allNames.length} permission names to super_admin`);
        return allNames;
      } catch (err) {
        console.error('❌ [REGISTRATION] Error fetching all permission names for super_admin:', err instanceof Error ? err.message : String(err));
        return [];
      }
    }

    const names = defaultPermissionNames[role] || [];
    console.log(`🔐 [REGISTRATION] Permission names for role ${role}:`, names);
    return names;
  }
}
