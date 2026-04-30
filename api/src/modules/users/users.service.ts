import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-f]{24}$/i.test(id);
  }

  private convertToObjectId(id: string): ObjectId {
    if (!this.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid user ID format: ${id}`);
    }
    return new ObjectId(id);
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    try {
      console.log('UsersService - Finding user with ID:', id);
      
      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        console.warn('UsersService - Invalid ObjectId format:', id);
        return null;
      }
      
      // Convert string to ObjectId for comparison
      const objectId = new ObjectId(id);
      
      // For MongoDB, we need to use find() and filter manually
      // because findOneBy() doesn't handle ObjectId comparisons properly
      const users = await this.usersRepository.find();
      const user = users.find(u => u.id.toString() === id || u.id.equals(objectId));
      
      if (user) {
        console.log('UsersService - User found:', { id: user.id.toString(), email: user.email });
        return user;
      }
      
      console.log('UsersService - User not found with ID:', id);
      return null;
    } catch (error) {
      console.error('UsersService - Error finding user by ID:', error.message);
      return null;
    }
  }

  async findByEmail(email: string) {
    console.log('UsersService - Finding user by email:', email);
    const user = await this.usersRepository.findOneBy({ email });
    console.log('UsersService - User found by email:', !!user);
    if (user) {
      console.log('UsersService - Found user ID:', user.id.toString());
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log(`🔄 [USERS-SERVICE] Updating user with ID:`, id);
    console.log(`🔄 [USERS-SERVICE] Update data:`, updateUserDto);
    
    const updateResult = await this.usersRepository.update(this.convertToObjectId(id), updateUserDto);
    console.log(`🔄 [USERS-SERVICE] Update result:`, updateResult);
    
    const updated = await this.findOne(id);
    console.log(`🔄 [USERS-SERVICE] User after update:`, {
      id: updated?.id,
      email: updated?.email,
      permissionIds: updated?.permissionIds,
      permissionCount: updated?.permissionIds?.length || 0
    });
    
    return updated;
  }

  async updateUserPermissions(id: string | ObjectId, permissionIds: string[]) {
    console.log(`🔐 [USERS-SERVICE] Updating permissions for user ID:`, id);
    console.log(`🔐 [USERS-SERVICE] New permissions:`, permissionIds);
    
    const objectId = typeof id === 'string' ? this.convertToObjectId(id) : id;
    const updateResult = await this.usersRepository.update(objectId, { permissionIds });
    console.log(`🔐 [USERS-SERVICE] Update result:`, updateResult);
    
    return updateResult;
  }

  async remove(id: string) {
    await this.usersRepository.delete(this.convertToObjectId(id));
    return { deleted: true };
  }
}
