import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplificarSinLotes1741900000001 implements MigrationInterface {
  name = 'SimplificarSinLotes1741900000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna cantidad a medicamento
    await queryRunner.query(
      `ALTER TABLE "medicamento" ADD COLUMN "cantidad" INTEGER NOT NULL DEFAULT 0`,
    );

    // Eliminar tabla lote_movimiento (depende de lote via FK)
    await queryRunner.query(`DROP TABLE IF EXISTS "lote_movimiento" CASCADE`);

    // Eliminar columna lote_id de dispensacion_detalle
    await queryRunner.query(
      `ALTER TABLE "dispensacion_detalle" DROP COLUMN IF EXISTS "lote_id"`,
    );

    // Eliminar tabla lote
    await queryRunner.query(`DROP TABLE IF EXISTS "lote" CASCADE`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // No implementado
  }
}
