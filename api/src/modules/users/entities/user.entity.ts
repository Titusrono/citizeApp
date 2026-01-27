import { Entity, ObjectIdColumn, Column, OneToMany } from 'typeorm';
import { Issue } from '../../issues/entities/issue.entity';
import { Signature } from '../../signatures/entities/signature.entity';
import { Vote } from '../../votes/entities/vote.entity';
import { ObjectId } from 'mongodb';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CONSTITUENCY_MANAGER = 'constituency_manager',
  WARD_MANAGER = 'ward_manager',
  CITIZEN = 'citizen',
}

@Entity('users')
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 15 })
  phone_no: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  subCounty: string;

  @Column({ length: 100 })
  ward: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role: UserRole;

  @Column({ nullable: true })
  auth_token: string;

  @OneToMany(() => Issue, (issue: Issue) => issue.user, { cascade: true })
  issues: Issue[];

  @OneToMany(() => Signature, (signature: Signature) => signature.user, { cascade: true })
  signatures: Signature[];

  @OneToMany(() => Vote, (vote: Vote) => vote.user, { cascade: true })
  votes: Vote[];
}
