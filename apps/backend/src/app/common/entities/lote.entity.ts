import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Medicamento } from './medicamento.entity';

@Entity('lote')
export class Lote {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Medicamento, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'medicamento_id' })
  medicamento!: Medicamento;

  @Column({ name: 'medicamento_id' })
  medicamentoId!: number;

  @Index({ unique: true })
  @Column({ name: 'codigo_qr', type: 'varchar', length: 100 })
  codigoQr!: string;

  @Column({ name: 'cantidad_inicial', type: 'int' })
  cantidadInicial!: number;

  @Column({ name: 'cantidad_actual', type: 'int' })
  cantidadActual!: number;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  donante!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  ubicacion!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
