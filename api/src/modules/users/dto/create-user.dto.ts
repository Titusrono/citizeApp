import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be a valid E.164 format' })
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
}
