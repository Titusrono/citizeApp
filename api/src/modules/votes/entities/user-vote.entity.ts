import { Entity, ObjectIdColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';
import { ObjectId } from 'mongodb';

/**
 * Tracks user votes on proposals
 * Prevents duplicate votes through application-level checks in VotesService
 */
@Entity('user_votes')
export class UserVote {
  @ObjectIdColumn()
  id!: ObjectId;

  @ManyToOne(() => Vote, { eager: true, onDelete: 'CASCADE' })
  vote!: Vote;

  @Column()
  voteId!: ObjectId;  // Explicit ID field for MongoDB queries

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user!: User;

  @Column()
  userId!: ObjectId;  // Explicit ID field for MongoDB queries

  @Column()
  voteValue!: 'yes' | 'no';

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
