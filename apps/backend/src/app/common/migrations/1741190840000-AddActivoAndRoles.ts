import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivoAndRoles1741190840000 implements MigrationInterface {
  name = 'AddActivoAndRoles1741190840000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add activo column to all tables
    await queryRunner.query(`
      ALTER TABLE "usuario" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "paciente" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "medicamento" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "lote" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "lote_movimiento" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "dispensacion" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "dispensacion_detalle" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "configuracion" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "nucleo_familiar" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
    await queryRunner.query(`
      ALTER TABLE "nucleo_familiar_miembro" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "nucleo_familiar_miembro" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "nucleo_familiar" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "configuracion" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "dispensacion_detalle" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "dispensacion" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "lote_movimiento" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "lote" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "medicamento" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "paciente" DROP COLUMN "activo"`);
    await queryRunner.query(`ALTER TABLE "usuario" DROP COLUMN "activo"`);
  }
}
