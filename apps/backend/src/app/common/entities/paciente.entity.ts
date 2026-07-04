import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sex } from '../enums/sex.enum';
import { Dispensacion } from './dispensacion.entity';

@Entity('paciente')
export class Paciente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'id_emergencia', type: 'varchar', length: 60 })
  idEmergencia!: string;

  @Column({ type: 'varchar', length: 1 })
  sexo!: Sex;

  @Column({ name: 'edad_estimada', type: 'int' })
  edadEstimada!: number;

  @Column({ name: 'peso_estimado', type: 'float' })
  pesoEstimado!: number;

  @Column({ name: 'es_damnificado', type: 'boolean', default: false })
  esDamnificado!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Dispensacion, (dispensacion) => dispensacion.paciente)
  dispensaciones!: Dispensacion[];
}
