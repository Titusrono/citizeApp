import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Signature } from '../../signatures/entities/signature.entity';
@Entity('petitions')
export class Petition {
  @PrimaryGeneratedColumn()
  petition_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ default: 0 })
  signature_count: number;

  @Column({ type: 'enum', enum: ['open', 'closed'], default: 'open' })
  status: string;

  @OneToMany(() => Signature, (signature: Signature) => signature.petition, { cascade: true })
  signatures: Signature[];
}