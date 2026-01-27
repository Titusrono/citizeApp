import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  username: string;
  phone_no: string;
  email: string;
  password: string;
  subCounty: string;
  ward: string;
  role?: UserRole;
}
