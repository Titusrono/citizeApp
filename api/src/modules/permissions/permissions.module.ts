import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { PermissionSeeder } from './seeds/permission.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionSeeder],
  exports: [PermissionsService],
})
export class PermissionsModule {}
