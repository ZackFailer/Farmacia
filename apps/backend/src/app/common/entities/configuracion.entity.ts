import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Medicamento } from './medicamento.entity';
import { Usuario } from './usuario.entity';

@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Medicamento, (medicamento) => medicamento.configuracion, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medicamento_id' })
  medicamento!: Medicamento;

  @Column({ name: 'medicamento_id', unique: true })
  medicamentoId!: number;

  @Column({ name: 'umbral_minimo', type: 'int', default: 10 })
  umbralMinimo!: number;

  @Column({ name: 'dosis_maxima_mg_kg', type: 'float', default: 0 })
  dosisMaximaMgKg!: number;

  @Column({ name: 'peso_referencia_kg', type: 'float', default: 70 })
  pesoReferenciaKg!: number;

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
