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

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20 })
  rol!: UserRole;

  @Column({ name: 'pin_hash', type: 'varchar', length: 255 })
  pinHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Dispensacion, (dispensacion) => dispensacion.usuario)
  dispensaciones!: Dispensacion[];
}
