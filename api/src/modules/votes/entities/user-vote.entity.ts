import { Entity, ObjectIdColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';
import { ObjectId } from 'mongodb';

@Entity('user_votes')
export class UserVote {
  @ObjectIdColumn()
  id!: ObjectId;

  @ManyToOne(() => Vote, { eager: true, onDelete: 'CASCADE' })
  vote!: Vote;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user!: User;

  @Column()
  voteValue!: 'yes' | 'no';

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
