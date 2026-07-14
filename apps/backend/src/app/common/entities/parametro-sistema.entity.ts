import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('parametro_sistema')
export class ParametroSistema {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 100 })
  clave!: string;

  @Column()
  valor!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
