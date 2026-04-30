import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  MANAGE = 'manage',
  VIEW = 'view', // Citizen read-only access (distinct from admin read)
}

export enum ResourceType {
  USERS = 'users',
  ISSUES = 'issues',
  PETITIONS = 'petitions',
  BLOGS = 'blogs',
  VOTES = 'votes',
  POLICIES = 'policies',
  TOWNHALLS = 'townhalls',
  REPORTS = 'reports',
  SIGNATURES = 'signatures',
}

@Entity('permissions')
export class Permission {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string; // e.g., 'create:issues', 'approve:petitions'

  @Column()
  action: ActionType;

  @Column()
  resource: ResourceType;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
