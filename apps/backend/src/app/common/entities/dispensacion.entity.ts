import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from './paciente.entity';
import { Receta } from './receta.entity';
import { Usuario } from './usuario.entity';
import { DispensacionDetalle } from './dispensacion-detalle.entity';

@Entity('dispensacion')
@Index(['fechaHora'])
export class Dispensacion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Paciente, (paciente) => paciente.dispensaciones, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId!: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.dispensaciones, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @Column({ name: 'usuario_id' })
  usuarioId!: number;

  @Column({ name: 'fecha_hora', type: 'timestamp' })
  fechaHora!: Date;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @ManyToOne(() => Receta, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta | null;

  @Column({ name: 'receta_id', nullable: true })
  recetaId!: number | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @OneToMany(() => DispensacionDetalle, (detalle) => detalle.dispensacion, {
    cascade: false,
  })
  detalles!: DispensacionDetalle[];
}
