import { IsEnum, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ActionType, ResourceType } from '../entities/permission.entity';

export class CreatePermissionDto {
  @IsEnum(ActionType)
  action: ActionType;

  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsEnum(ActionType)
  action?: ActionType;

  @IsOptional()
  @IsEnum(ResourceType)
  resource?: ResourceType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissionIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
