import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NucleoFamiliarMiembro } from './nucleo-familiar-miembro.entity';
import { Paciente } from './paciente.entity';
import { Usuario } from './usuario.entity';

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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Trazabilidad
  @Column({ name: 'created_by_id', nullable: true })
  createdById?: number;
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: Usuario;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById?: number;
  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: Usuario;
}
