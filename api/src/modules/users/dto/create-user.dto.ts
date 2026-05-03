import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, Matches, IsArray } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[0-9]{9}|\+254[0-9]{9})$/, { message: 'Phone number must be in format 07XXXXXXXXX or +254XXXXXXXXX' })
  phone_no: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  subCounty: string;

  @IsString()
  @IsNotEmpty()
  ward: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsOptional()
  permissionIds?: string[];
}
