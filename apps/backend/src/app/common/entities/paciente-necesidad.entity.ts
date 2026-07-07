import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Paciente } from './paciente.entity';
import { CatalogoNecesidad } from './necesidad.entity';

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
}
