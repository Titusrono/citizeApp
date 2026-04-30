import { Entity, ObjectIdColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string; // 'admin', 'moderator', 'super_admin', etc.

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, { eager: true, cascade: true })
  @JoinTable()
  permissions: Permission[];

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
