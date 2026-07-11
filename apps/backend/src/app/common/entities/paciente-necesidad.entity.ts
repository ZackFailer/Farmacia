import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Paciente } from './paciente.entity';
import { CatalogoNecesidad } from './necesidad.entity';
import { Usuario } from './usuario.entity';

@Entity('paciente_necesidad')
export class PacienteNecesidad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId!: number;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ name: 'necesidad_id', type: 'int' })
  necesidadId!: number;

  @ManyToOne(() => CatalogoNecesidad, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'necesidad_id' })
  necesidad!: CatalogoNecesidad;

  @Column({ default: false })
  suplida!: boolean;

  @Column({ name: 'fecha_suplida', type: 'datetime', nullable: true })
  fechaSuplida?: Date;

  @Column({ name: 'suplida_por_id', type: 'int', nullable: true })
  suplidaPorId?: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'suplida_por_id' })
  suplidaPor?: Usuario;

  @Column({ name: 'created_by_id', nullable: true })
  createdById?: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: Usuario;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
