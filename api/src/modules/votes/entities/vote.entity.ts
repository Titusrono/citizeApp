import { Entity, ObjectIdColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Policy } from '../../policies/entities/policy.entity';
import { ObjectId } from 'mongodb';

@Entity('votes')
export class Vote {
  @ObjectIdColumn()
  id: ObjectId;

  @ManyToOne(() => Policy, (policy: Policy) => policy.votes, { onDelete: 'CASCADE' })
  policy: Policy;

  @ManyToOne(() => User, (user: User) => user.votes, { onDelete: 'CASCADE' })
  user: User;
}