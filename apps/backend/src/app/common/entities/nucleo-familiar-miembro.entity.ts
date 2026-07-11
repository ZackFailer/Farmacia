import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NucleoFamiliar } from './nucleo-familiar.entity';
import { Paciente } from './paciente.entity';
import { Usuario } from './usuario.entity';

@Entity('nucleo_familiar_miembro')
export class NucleoFamiliarMiembro {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nucleo_id', type: 'int' })
  nucleoId!: number;

  @Exclude()
  @ManyToOne(() => NucleoFamiliar, (n) => n.miembros, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nucleo_id' })
  nucleo!: NucleoFamiliar;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId!: number;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ type: 'varchar', length: 30 })
  relacion!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  // Trazabilidad
  @Column({ name: 'created_by_id', nullable: true })
  createdById?: number;
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: Usuario;
}
