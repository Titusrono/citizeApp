import { Injectable } from '@nestjs/common';
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
      console.log('UsersService - ID type:', typeof id);
      console.log('UsersService - ID length:', id.length);
      
      // Debug: Let's see what users exist in the database
      const allUsers = await this.usersRepository.find();
      console.log('UsersService - Total users in DB:', allUsers.length);
      if (allUsers.length > 0) {
        const firstUser = allUsers[0];
        console.log('UsersService - First user ID:', firstUser.id);
        console.log('UsersService - First user ID type:', typeof firstUser.id);
        console.log('UsersService - First user ID toString():', firstUser.id.toString());
        console.log('UsersService - Looking for ID matches target:', firstUser.id.toString() === id);
      }
      
      // Method 1: Find by matching string representation
      const userByStringMatch = allUsers.find(user => user.id.toString() === id);
      if (userByStringMatch) {
        console.log('UsersService - User found by string match');
        return userByStringMatch;
      }
      
      // Method 2: Try the traditional ObjectId approach
      if (ObjectId.isValid(id)) {
        const user = await this.usersRepository.findOne({
          where: { id: new ObjectId(id) } as any
        });
        if (user) {
          console.log('UsersService - User found with ObjectId');
          return user;
        }
      }
      
      console.log('UsersService - User not found with ID:', id);
      return null;
    } catch (error) {
      console.error('UsersService - Error finding user:', error);
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
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.usersRepository.delete(new ObjectId(id));
    return { deleted: true };
  }
}
