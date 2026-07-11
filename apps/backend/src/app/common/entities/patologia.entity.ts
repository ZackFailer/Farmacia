import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('catalogo_patologia')
export class CatalogoPatologia {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

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
