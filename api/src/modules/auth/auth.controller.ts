import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsService } from '../permissions/permissions.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionsService: PermissionsService,
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; phone_no: string; email: string; password: string; subCounty: string; ward: string; role?: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    try {
      console.log('📋 [Auth] GET /me endpoint called');
      console.log('👤 [Auth] JWT payload:', Object.keys(req.user));

      // Extract user ID from JWT payload
      const userId = req.user.id || req.user.sub || req.user._id;
      console.log('👤 [Auth] Looking up full user document for ID:', userId);

      // Fetch full user document from database (includes permissionIds)
      const fullUser = await this.usersService.findOne(userId);
      
      if (!fullUser) {
        console.error('❌ [Auth] User document not found in database for ID:', userId);
        throw new Error('User document not found');
      }

      console.log('👤 [Auth] Full user from DB:', {
        id: fullUser.id,
        email: fullUser.email,
        role: fullUser.role,
        permissionIds: fullUser.permissionIds,
        permissionNames: fullUser.permissionNames,
        permissionCount: fullUser.permissionIds?.length || 0
      });

      // Auto-assign permissions if user is admin/super_admin and has none
      if ((!fullUser.permissionIds || fullUser.permissionIds.length === 0) && 
          ['admin', 'super_admin'].includes(fullUser.role)) {
        console.log(`🔐 [Auth] User ${fullUser.email} (${fullUser.role}) has no permissions. Auto-assigning...`);
        
        try {
          const defaultPermissionIds = await this.permissionsService.getDefaultPermissionsForRole(fullUser.role);
          const defaultPermissionNames = await this.permissionsService.getDefaultPermissionNamesForRole(fullUser.role);
          console.log(`✅ [Auth] Auto-assigned ${defaultPermissionIds.length} permissions to ${fullUser.email}`);
          
          // Update user with permissions
          await this.usersService.updateUserPermissions(userId, defaultPermissionIds);
          fullUser.permissionIds = defaultPermissionIds;
          fullUser.permissionNames = defaultPermissionNames;
        } catch (err) {
          console.error('❌ [Auth] Failed to auto-assign permissions:', err instanceof Error ? err.message : String(err));
          // Continue anyway - user can proceed without permissions
        }
      }

      return fullUser;
    } catch (err) {
      console.error('❌ [Auth] GET /me failed:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }
}