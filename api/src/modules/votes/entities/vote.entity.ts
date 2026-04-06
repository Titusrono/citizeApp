import { Entity, ObjectIdColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Policy } from '../../policies/entities/policy.entity';
import { ObjectId } from 'mongodb';

export enum VoteLevel {
  GENERAL = 'general',
  SUB_COUNTY = 'sub_county',
  WARD = 'ward',
}

@Entity('votes')
export class Vote {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  eligibility!: string;

  @Column()
  end_date!: Date;

  @Column({ type: 'enum', enum: VoteLevel, default: VoteLevel.GENERAL })
  voteLevel!: VoteLevel;

  @Column({ nullable: true })
  selectedSubCounties?: string[];

  @Column({ nullable: true })
  selectedWards?: string[];

  @ManyToOne(() => Policy, (policy: Policy) => policy.votes, { onDelete: 'CASCADE' })
  policy?: Policy;

  @ManyToOne(() => User, (user: User) => user.votes, { onDelete: 'CASCADE' })
  user?: User;
}