import { Exclude, Expose } from 'class-transformer';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Sex } from '../enums/sex.enum';
import { SituacionVivienda } from '../enums/situacion-vivienda.enum';
import { Dispensacion } from './dispensacion.entity';
import { NucleoFamiliarMiembro } from './nucleo-familiar-miembro.entity';
import { PacientePatologia } from './paciente-patologia.entity';
import { PacienteNecesidad } from './paciente-necesidad.entity';
import { Usuario } from './usuario.entity';

@Entity('paciente')
export class Paciente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ name: 'id_emergencia', type: 'varchar', length: 60 })
  idEmergencia!: string;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 120 })
  apellido!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  cedula!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ type: 'varchar', length: 1 })
  sexo!: Sex;

  @Column({ name: 'edad_estimada', type: 'int' })
  edadEstimada!: number;

  @Column({ name: 'fecha_nacimiento', type: 'varchar', length: 10, nullable: true })
  fechaNacimiento!: string | null;

  @Column({ name: 'edad_manual', type: 'int', nullable: true })
  edadManual!: number | null;

  @Column({ name: 'es_recien_nacido', type: 'boolean', default: false })
  esRecienNacido!: boolean;

  @Column({ name: 'peso_estimado', type: 'float' })
  pesoEstimado!: number;

  @Column({ name: 'situacion_vivienda', type: 'varchar', length: 20, default: 'no_afectado' })
  situacionVivienda!: SituacionVivienda;

  @Column({ name: 'tiene_carga_familiar', type: 'boolean', default: false })
  tieneCargaFamiliar!: boolean;

  @Column({ name: 'tiene_discapacidad_motora', type: 'boolean', default: false })
  tieneDiscapacidadMotora!: boolean;

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

  @OneToMany(() => Dispensacion, (dispensacion) => dispensacion.paciente)
  dispensaciones!: Dispensacion[];

  @OneToMany(() => PacientePatologia, (pp) => pp.paciente, { cascade: true })
  pacientePatologias!: PacientePatologia[];

  @OneToMany(() => PacienteNecesidad, (pn) => pn.paciente, { cascade: true })
  pacienteNecesidades!: PacienteNecesidad[];

  @Exclude()
  @OneToMany(() => NucleoFamiliarMiembro, (m) => m.paciente)
  _familiaresBacking!: NucleoFamiliarMiembro[];

  @Exclude()
  private _edadEstimadaComputed!: number;

  @Expose({ name: 'familiares' })
  get familiaresMiembros(): NucleoFamiliarMiembro[] {
    if (!this._familiaresBacking) return [];
    return this._familiaresBacking.flatMap((m) =>
      m.nucleo?.miembros?.filter((member) => member.pacienteId !== this.id) ?? [],
    );
  }

  @Expose()
  get codigoCarpa(): string | undefined {
    return this._familiaresBacking?.find((m) => m.nucleo?.codigoCarpa)?.nucleo?.codigoCarpa ?? undefined;
  }

  @AfterLoad()
  private computeEdad(): void {
    this._edadEstimadaComputed = this.edadEstimada;
  }
}
