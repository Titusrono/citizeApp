import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
    @Inject(ConfigService) private readonly configService: ConfigService
  ) {}

  async register(data: { username: string; phone_no: string; email: string; password: string; subCounty: string; ward: string; role?: string }) {
    try {
      // Check if user exists
      const existingUser = await this.usersService.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException('User already exists');
      }

      console.log('✅ [AUTH] Starting registration for:', data.email);

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Determine user role (default to citizen)
      const userRole = (data.role as UserRole) || UserRole.CITIZEN;
      console.log(`🔑 [AUTH] User role: ${userRole}`);

      // NOTE: Permissions are NO LONGER assigned based on role
      // Permissions are assigned individually through the admin permissions modal
      // New users start with NO permissions until admin assigns them
      console.log(`🔒 [AUTH] Permissions will be assigned individually via permissions modal (not role-based)`);
      
      const defaultPermissionIds: string[] = [];
      const defaultPermissionNames: string[] = [];

      // Create user with NO default permissions
      const userData = {
        ...data,
        password: hashedPassword,
        role: userRole,
        permissionIds: defaultPermissionIds,
        permissionNames: defaultPermissionNames,
      };

      console.log(`📝 [AUTH] Creating user document:`, {
        email: userData.email,
        role: userData.role,
        permissionIdsCount: userData.permissionIds.length,
      });

      const user = await this.usersService.create(userData);

      console.log(`✅ [AUTH] User created successfully:`, {
        id: user.id,
        email: user.email,
        role: user.role,
        permissionIdsCount: user.permissionIds ? user.permissionIds.length : 0,
        permissionIds: user.permissionIds
      });

      // Return without password
      const { password, ...result } = user;
      return result;
    } catch (err) {
      console.error(`❌ [AUTH] Registration failed:`, err.message);
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new Error(`Registration failed: ${err.message}`);
    }
  }

  async login(data: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const userId = user.id.toString();
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'secret-key-change-in-production';
    console.log('Auth Service - Generating token for user ID:', userId);
    const payload = { email: user.email, sub: userId, role: user.role };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
    console.log('Auth Service - Generated payload:', payload);

    return { access_token: token };
  }
}