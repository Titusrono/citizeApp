import { Entity, ObjectIdColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Signature } from '../../signatures/entities/signature.entity';
import { ObjectId } from 'mongodb';

@Entity('petitions')
export class Petition {
  @ObjectIdColumn()
  id!: ObjectId;

  @ManyToOne(() => User, (user) => user.petitions, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 255, nullable: true })
  targetAuthority?: string;

  @Column({ length: 100, nullable: true })
  category?: string;

  @Column({ nullable: true })
  supportingDocs?: string;

  @Column({ default: 0 })
  signature_count!: number;

  @Column({ type: 'enum', enum: ['open', 'closed'], default: 'open' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Signature, (signature: Signature) => signature.petition, { cascade: true })
  signatures!: Signature[];
}