import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Receta } from './receta.entity';
import { Medicamento } from './medicamento.entity';

@Entity('receta_detalle')
export class RecetaDetalle {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Receta, (receta) => receta.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receta_id' })
  receta!: Receta;

  @Column({ name: 'receta_id' })
  recetaId!: number;

  @ManyToOne(() => Medicamento, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medicamento_id' })
  medicamento!: Medicamento;

  @Column({ name: 'medicamento_id' })
  medicamentoId!: number;

  @Column({ name: 'cantidad_recetada', type: 'int' })
  cantidadRecetada!: number;

  @Column({ type: 'int' })
  dias!: number;

  @Column({ name: 'dosis_indicada', type: 'varchar', length: 255, nullable: true })
  dosisIndicada!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
