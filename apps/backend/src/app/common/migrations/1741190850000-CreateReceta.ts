import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReceta1741190850000 implements MigrationInterface {
  name = 'CreateReceta1741190850000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receta" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "paciente_id" integer NOT NULL,
        "doctor_id" integer NOT NULL,
        "fecha_hora" datetime NOT NULL,
        "estado" varchar(20) NOT NULL DEFAULT ('pendiente'),
        "activo" boolean NOT NULL DEFAULT (1),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_receta_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_receta_doctor" FOREIGN KEY ("doctor_id") REFERENCES "usuario" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "receta_detalle" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "receta_id" integer NOT NULL,
        "medicamento_id" integer NOT NULL,
        "cantidad_recetada" integer NOT NULL,
        "dias" integer NOT NULL,
        "dosis_indicada" varchar(255),
        "activo" boolean NOT NULL DEFAULT (1),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_receta_detalle_receta" FOREIGN KEY ("receta_id") REFERENCES "receta" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_receta_detalle_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_receta_fecha" ON "receta" ("fecha_hora")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "receta_detalle"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "receta"`);
  }
}
