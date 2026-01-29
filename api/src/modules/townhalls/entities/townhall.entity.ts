import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('townhalls')
export class Townhall {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ length: 255 })
  title: string;

  @Column({ nullable: true })
  recording_url: string;
}
