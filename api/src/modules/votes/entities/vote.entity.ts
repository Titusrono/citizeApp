import { Entity, ObjectIdColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Policy } from '../../policies/entities/policy.entity';
import { ObjectId } from 'mongodb';

@Entity('votes')
export class Vote {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  eligibility: string;

  @Column()
  end_date: Date;

  @ManyToOne(() => Policy, (policy: Policy) => policy.votes, { onDelete: 'CASCADE' })
  policy: Policy;

  @ManyToOne(() => User, (user: User) => user.votes, { onDelete: 'CASCADE' })
  user: User;
}