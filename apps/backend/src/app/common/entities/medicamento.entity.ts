import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Configuracion } from './configuracion.entity';
import { DispensacionDetalle } from './dispensacion-detalle.entity';
import { Usuario } from './usuario.entity';

@Entity('medicamento')
export class Medicamento {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'nombre_generico', type: 'varchar', length: 120 })
  nombreGenerico!: string;

  @Column({ name: 'nombre_comercial', type: 'varchar', length: 120, nullable: true })
  nombreComercial!: string | null;

  @Column({ type: 'varchar', length: 80 })
  presentacion!: string;

  @Column({ type: 'float' })
  concentracion!: number;

  @Column({ name: 'unidad_concentracion', type: 'varchar', length: 10, default: 'mg' })
  unidadConcentracion!: string;

  @Column({ name: 'es_vital', type: 'boolean', default: false })
  esVital!: boolean;

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

  @OneToMany(() => DispensacionDetalle, (detalle) => detalle.medicamento)
  dispensacionDetalles!: DispensacionDetalle[];

  @OneToOne(() => Configuracion, (configuracion) => configuracion.medicamento)
  configuracion!: Configuracion;
}
