import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch('email/:email/permissions')
  async updateUserPermissions(
    @Param('email') email: string,
    @Body() { permissionIds }: { permissionIds: string[] }
  ) {
    console.log(`📝 [USERS] Updating permissions for user: ${email}`);
    console.log(`📝 [USERS] Permission IDs to save:`, permissionIds);
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    console.log(`📝 [USERS] User found:`, { id: user.id, email: user.email });
    const updated = await this.usersService.update(user.id.toString(), { permissionIds } as any);
    console.log(`✅ [USERS] Permissions updated for user: ${email}`);
    if (updated) {
      console.log(`✅ [USERS] Updated user:`, { 
        id: updated.id, 
        email: updated.email, 
        permissionIds: updated.permissionIds,
        permissionCount: updated.permissionIds?.length || 0
      });
    }
    return updated;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('email/:email')
  async updateByEmail(@Param('email') email: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.update(user.id.toString(), updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete('email/:email')
  async removeByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.remove(user.id.toString());
  }
}
