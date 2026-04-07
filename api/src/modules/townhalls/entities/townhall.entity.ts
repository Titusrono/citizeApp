import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('townhalls')
export class Townhall {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ length: 255 })
  title: string;

  @Column({ nullable: true })
  agenda: string;

  @Column({ nullable: true })
  date: string;

  @Column({ nullable: true })
  meetLink: string;

  @Column({ nullable: true })
  recordingLink: string;

  @Column({ nullable: true, default: false })
  isLive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
