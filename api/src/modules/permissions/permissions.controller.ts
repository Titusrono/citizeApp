import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto, UpdatePermissionDto, CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // ===== PERMISSIONS =====

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  async getAllPermissions() {
    const permissions = await this.permissionsService.getAllPermissions();
    console.log('📡 [PERMISSIONS-API] getAllPermissions returning:', permissions.length, 'permissions');
    console.log('📋 [PERMISSIONS-API] Permissions:', permissions.map((p: any) => `${p.action}:${p.resource}`));
    return permissions;
  }

  @Get('/:id')
  async getPermissionById(@Param('id') id: string) {
    return this.permissionsService.getPermissionById(id);
  }

  @Post('/by-ids')
  async getPermissionsByIds(@Body() { ids }: { ids: string[] }) {
    console.log('📨 [PERMISSIONS-CONTROLLER] POST /by-ids called');
    console.log('📨 [PERMISSIONS-CONTROLLER] Received IDs:', ids);
    const result = await this.permissionsService.getPermissionsByIds(ids);
    console.log('📨 [PERMISSIONS-CONTROLLER] Returning', result.length, 'permissions');
    return result;
  }

  @Post('/by-names')
  async getPermissionsByNames(@Body() { names }: { names: string[] }) {
    console.log('📨 [PERMISSIONS-CONTROLLER] POST /by-names called');
    console.log('📨 [PERMISSIONS-CONTROLLER] Received names:', names);
    const result = await this.permissionsService.getPermissionsByNames(names);
    console.log('📨 [PERMISSIONS-CONTROLLER] Returning', result.length, 'permissions');
    return result;
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.updatePermission(id, updatePermissionDto);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }

  // ===== ROLES =====

  @Post('/roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.permissionsService.createRole(createRoleDto);
  }

  @Get('/roles')
  async getAllRoles() {
    return this.permissionsService.getAllRoles();
  }

  @Get('/roles/name/:name')
  async getRoleByName(@Param('name') name: string) {
    return this.permissionsService.getRoleByName(name);
  }

  @Get('/roles/:id')
  async getRoleById(@Param('id') id: string) {
    return this.permissionsService.getRoleById(id);
  }

  @Patch('/roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.permissionsService.updateRole(id, updateRoleDto);
  }

  @Delete('/roles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async deleteRole(@Param('id') id: string) {
    return this.permissionsService.deleteRole(id);
  }

  @Post('/roles/:id/permissions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async assignPermissionsToRole(
    @Param('id') id: string,
    @Body() { permissionIds }: { permissionIds: string[] },
  ) {
    return this.permissionsService.assignPermissionsToRole(id, permissionIds);
  }

  @Post('/seed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async seedPermissions() {
    await this.permissionsService.seedDefaultPermissions();
    return { message: 'Default permissions seeded successfully' };
  }
}
