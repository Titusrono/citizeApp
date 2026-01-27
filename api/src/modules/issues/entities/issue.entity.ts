import { Entity, ObjectIdColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ObjectId } from 'mongodb';

@Entity('issues')
export class Issue {
  @ObjectIdColumn()
  id: ObjectId;

  @ManyToOne(() => User, (user) => user.issues, { onDelete: 'CASCADE' })
  user: User;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ['open', 'in_progress', 'resolved'], default: 'open' })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  geolocation: string;
}
