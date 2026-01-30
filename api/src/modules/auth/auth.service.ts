import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(data: { username: string; phone_no: string; email: string; password: string; subCounty: string; ward: string; role?: string }) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
      role: data.role as UserRole,
    });

    // Return without password
    const { password, ...result } = user;
    return result;
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
    console.log('Auth Service - Generating token for user ID:', userId);
    const payload = { email: user.email, sub: userId, role: user.role };
    const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });
    console.log('Auth Service - Generated payload:', payload);

    return { access_token: token };
  }
}