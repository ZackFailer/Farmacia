import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NucleoFamiliarMiembro } from './nucleo-familiar-miembro.entity';
import { Paciente } from './paciente.entity';

@Entity('nucleo_familiar')
export class NucleoFamiliar {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'titular_id' })
  titular!: Paciente;

  @OneToMany(() => NucleoFamiliarMiembro, (m) => m.nucleo, { cascade: true })
  miembros!: NucleoFamiliarMiembro[];

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
