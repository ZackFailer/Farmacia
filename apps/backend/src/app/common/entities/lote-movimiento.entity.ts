import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovementType } from '../enums/movement-type.enum';
import { Lote } from './lote.entity';
import { Usuario } from './usuario.entity';

@Entity('lote_movimiento')
export class LoteMovimiento {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Lote, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lote_id' })
  lote!: Lote;

  @Column({ name: 'lote_id' })
  loteId!: number;

  @Column({ type: 'varchar', length: 20 })
  tipo!: MovementType;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo!: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario | null;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId!: number | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
