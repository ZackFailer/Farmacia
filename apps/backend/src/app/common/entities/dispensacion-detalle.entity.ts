import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Dispensacion } from './dispensacion.entity';
import { Lote } from './lote.entity';
import { Medicamento } from './medicamento.entity';

@Entity('dispensacion_detalle')
export class DispensacionDetalle {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Dispensacion, (dispensacion) => dispensacion.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dispensacion_id' })
  dispensacion!: Dispensacion;

  @Column({ name: 'dispensacion_id' })
  dispensacionId!: number;

  @ManyToOne(() => Lote, (lote) => lote.dispensacionDetalles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @Column({ name: 'lote_id' })
  loteId!: number;

  @ManyToOne(() => Medicamento, (medicamento) => medicamento.dispensacionDetalles, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'medicamento_id' })
  medicamento!: Medicamento;

  @Column({ name: 'medicamento_id' })
  medicamentoId!: number;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ name: 'dosis_mg_kg', type: 'float' })
  dosisMgKg!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
