import { MigrationInterface, QueryRunner } from 'typeorm';

export class EliminarLotesYAgregarTrazabilidad1741900000000 implements MigrationInterface {
  name = 'EliminarLotesYAgregarTrazabilidad1741900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // ===== TRAZABILIDAD =====

    // Medicamento
    await queryRunner.query(
      `ALTER TABLE "medicamento" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "medicamento" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // Paciente
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD COLUMN "updated_at" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // NucleoFamiliar
    await queryRunner.query(
      `ALTER TABLE "nucleo_familiar" ADD COLUMN "updated_at" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nucleo_familiar" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "nucleo_familiar" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // NucleoFamiliarMiembro
    await queryRunner.query(
      `ALTER TABLE "nucleo_familiar_miembro" ADD COLUMN "created_by_id" integer NULL`,
    );

    // PacientePatologia
    await queryRunner.query(
      `ALTER TABLE "paciente_patologia" ADD COLUMN "created_by_id" integer NULL`,
    );

    // Configuracion
    await queryRunner.query(
      `ALTER TABLE "configuracion" ADD COLUMN "created_at" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "configuracion" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "configuracion" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // Usuario
    await queryRunner.query(
      `ALTER TABLE "usuario" ADD COLUMN "created_by_id" integer NULL`,
    );

    // CatalogoPatologia
    await queryRunner.query(
      `ALTER TABLE "catalogo_patologia" ADD COLUMN "updated_at" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogo_patologia" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogo_patologia" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // CatalogoNecesidad
    await queryRunner.query(
      `ALTER TABLE "catalogo_necesidad" ADD COLUMN "updated_at" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogo_necesidad" ADD COLUMN "created_by_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "catalogo_necesidad" ADD COLUMN "updated_by_id" integer NULL`,
    );

    // ===== SIMPLIFICACIÓN: hacer lote_id nullable en dispensacion_detalle =====
    // SQLite no soporta ALTER COLUMN; se recrea la tabla.
    await queryRunner.query(`PRAGMA foreign_keys=OFF`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dispensacion_detalle_temp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "dispensacion_id" integer NOT NULL,
        "lote_id" integer NULL,
        "medicamento_id" integer NOT NULL,
        "cantidad" integer NOT NULL,
        "dosis_mg_kg" float NOT NULL DEFAULT (0),
        "activo" boolean NOT NULL DEFAULT (1),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("dispensacion_id") REFERENCES "dispensacion"("id") ON DELETE CASCADE,
        FOREIGN KEY ("lote_id") REFERENCES "lote"("id") ON DELETE RESTRICT,
        FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `INSERT INTO "dispensacion_detalle_temp" SELECT * FROM "dispensacion_detalle"`,
    );
    await queryRunner.query(`DROP TABLE "dispensacion_detalle"`);
    await queryRunner.query(
      `ALTER TABLE "dispensacion_detalle_temp" RENAME TO "dispensacion_detalle"`,
    );

    // ===== SIMPLIFICACIÓN: hacer cantidad_recetada nullable en receta_detalle =====
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receta_detalle_temp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "receta_id" integer NOT NULL,
        "medicamento_id" integer NOT NULL,
        "cantidad_recetada" integer NULL,
        "dias" integer NULL,
        "dosis_indicada" varchar(255) NULL,
        "activo" boolean NOT NULL DEFAULT (1),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE,
        FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `INSERT INTO "receta_detalle_temp" SELECT * FROM "receta_detalle"`,
    );
    await queryRunner.query(`DROP TABLE "receta_detalle"`);
    await queryRunner.query(
      `ALTER TABLE "receta_detalle_temp" RENAME TO "receta_detalle"`,
    );

    await queryRunner.query(`PRAGMA foreign_keys=ON`);

    // Actualizar registros existentes: created_at para configuracion con valor por defecto
    await queryRunner.query(
      `UPDATE "configuracion" SET "created_at" = "updated_at" WHERE "created_at" IS NULL`,
    );
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // No implementado: para revertir restaurar desde backup
  }
}
