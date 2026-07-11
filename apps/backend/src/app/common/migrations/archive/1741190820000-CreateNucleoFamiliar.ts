import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNucleoFamiliar1741190820000 implements MigrationInterface {
  name = 'CreateNucleoFamiliar1741190820000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create nucleo_familiar table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "nucleo_familiar" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "titular_id" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    // Create nucleo_familiar_miembro table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "nucleo_familiar_miembro" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "nucleo_id" integer NOT NULL,
        "paciente_id" integer NOT NULL,
        "relacion" varchar(30) NOT NULL,
        CONSTRAINT "UQ_nucleo_familiar_miembro_paciente" UNIQUE ("paciente_id"),
        CONSTRAINT "FK_nucleo_familiar_miembro_nucleo" FOREIGN KEY ("nucleo_id") REFERENCES "nucleo_familiar" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_nucleo_familiar_miembro_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente" ("id")
      )
    `);

    // Drop old paciente_familiar table (data is not migrated — schema-only change)
    await queryRunner.query(`DROP TABLE IF EXISTS "paciente_familiar"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate paciente_familiar table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "paciente_familiar" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "paciente_id" integer NOT NULL,
        "familiar_id" integer NOT NULL,
        "relacion" varchar(30) NOT NULL,
        CONSTRAINT "FK_paciente_familiar_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_paciente_familiar_familiar" FOREIGN KEY ("familiar_id") REFERENCES "paciente" ("id")
      )
    `);

    // Drop nucleo tables
    await queryRunner.query(`DROP TABLE IF EXISTS "nucleo_familiar_miembro"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nucleo_familiar"`);
  }
}
