import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity('blogs')
export class Blog {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column()
  date: string;

  @Column()
  summary: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
