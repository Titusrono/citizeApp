import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('townhalls')
export class Townhall {
  @PrimaryGeneratedColumn()
  event_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ nullable: true })
  recording_url: string;
}
