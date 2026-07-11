import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enums/role.enum';
import { Dispensacion } from './dispensacion.entity';
import { PacienteNecesidad } from './paciente-necesidad.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20 })
  rol!: UserRole;

  @Column({ name: 'pin_hash', type: 'varchar', length: 255 })
  pinHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Dispensacion, (dispensacion) => dispensacion.usuario)
  dispensaciones!: Dispensacion[];

  @OneToMany(() => PacienteNecesidad, (pn) => pn.suplidaPor)
  necesidadesSuplidas!: PacienteNecesidad[];
}
