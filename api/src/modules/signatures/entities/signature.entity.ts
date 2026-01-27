import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Petition } from '../../petitions/entities/petition.entity';
@Entity('signatures')
export class Signature {
  @PrimaryGeneratedColumn()
  signature_id: number;

  @ManyToOne(() => Petition, (petition) => petition.signatures, { onDelete: 'CASCADE' })
  petition: Petition;

  @ManyToOne(() => User, (user) => user.signatures, { onDelete: 'CASCADE' })
  user: User;
}
