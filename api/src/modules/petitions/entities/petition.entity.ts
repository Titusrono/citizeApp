import { Entity, ObjectIdColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Signature } from '../../signatures/entities/signature.entity';
import { ObjectId } from 'mongodb';

@Entity('petitions')
export class Petition {
  @ObjectIdColumn()
  id: ObjectId;

  @ManyToOne(() => User, (user) => user.petitions, { onDelete: 'CASCADE' })
  user: User;

  @Column({ length: 255 })
  title: string;

  @Column({ default: 0 })
  signature_count: number;

  @Column({ type: 'enum', enum: ['open', 'closed'], default: 'open' })
  status: string;

  @OneToMany(() => Signature, (signature: Signature) => signature.petition, { cascade: true })
  signatures: Signature[];
}