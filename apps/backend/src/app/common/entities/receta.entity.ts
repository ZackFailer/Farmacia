import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Usuario } from './usuario.entity';
import { RecetaDetalle } from './receta-detalle.entity';

export type RecetaEstado = 'pendiente' | 'despachada' | 'cancelada';

@Entity('receta')
@Index(['fechaHora'])
export class Receta {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Paciente, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId!: number;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  doctor!: Usuario;

  @Column({ name: 'doctor_id' })
  doctorId!: number;

  @Column({ name: 'fecha_hora', type: 'timestamp' })
  fechaHora!: Date;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: RecetaEstado;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  motivo!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => RecetaDetalle, (detalle) => detalle.receta, { cascade: false })
  detalles!: RecetaDetalle[];
}
