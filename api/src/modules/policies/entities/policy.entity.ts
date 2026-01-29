import { Entity, ObjectIdColumn, Column, OneToMany } from 'typeorm';
import { Vote } from '../../votes/entities/vote.entity';
import { ObjectId } from 'mongodb';

@Entity('policies')
export class Policy {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ length: 255 })
  title: string;

  @Column({ default: 0 })
  vote_count: number;

  @OneToMany(() => Vote, (vote) => vote.policy, { cascade: true })
  votes: Vote[];
}