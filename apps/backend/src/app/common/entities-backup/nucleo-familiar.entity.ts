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
import { NucleoFamiliarMiembro } from './nucleo-familiar-miembro.entity';
import { Paciente } from './paciente.entity';

@Entity('nucleo_familiar')
export class NucleoFamiliar {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'codigo_carpa', type: 'varchar', length: 20, nullable: true })
  codigoCarpa!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  ubicacion!: string | null;

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
