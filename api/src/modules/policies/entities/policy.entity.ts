import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Vote } from '../../votes/entities/vote.entity';
@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn()
  policy_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ default: 0 })
  vote_count: number;

  @OneToMany(() => Vote, (vote) => vote.policy, { cascade: true })
  votes: Vote[];
}