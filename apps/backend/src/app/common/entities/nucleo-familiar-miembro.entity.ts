import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NucleoFamiliar } from './nucleo-familiar.entity';
import { Paciente } from './paciente.entity';

@Entity('nucleo_familiar_miembro')
export class NucleoFamiliarMiembro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nucleo_id', type: 'int' })
  nucleoId!: number;

  @ManyToOne(() => NucleoFamiliar, (n) => n.miembros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nucleo_id' })
  nucleo!: NucleoFamiliar;

  @Column({ name: 'paciente_id', type: 'int', unique: true })
  pacienteId!: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ type: 'varchar', length: 30 })
  relacion!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
