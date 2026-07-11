import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Medicamento } from './medicamento.entity';

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

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
