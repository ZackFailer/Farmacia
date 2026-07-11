import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paciente } from './paciente.entity';
import { CatalogoPatologia } from './patologia.entity';

@Entity('paciente_patologia')
export class PacientePatologia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId!: number;

  @ManyToOne(() => Paciente, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Paciente;

  @Column({ name: 'patologia_id', type: 'int' })
  patologiaId!: number;

  @ManyToOne(() => CatalogoPatologia, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patologia_id' })
  patologia!: CatalogoPatologia;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tratamiento!: string | null;
}
