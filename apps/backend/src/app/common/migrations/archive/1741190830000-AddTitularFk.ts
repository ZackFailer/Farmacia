import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTitularFk1741190830000 implements MigrationInterface {
  name = 'AddTitularFk1741190830000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite does not support ALTER TABLE ADD CONSTRAINT.
    // Recreate the table with the FK constraint and copy existing data.
    await queryRunner.query(`
      CREATE TABLE "nucleo_familiar_temp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "titular_id" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_nucleo_familiar_titular" FOREIGN KEY ("titular_id") REFERENCES "paciente" ("id")
      )
    `);
    await queryRunner.query(`INSERT INTO "nucleo_familiar_temp" SELECT "id", "titular_id", "created_at" FROM "nucleo_familiar"`);
    await queryRunner.query(`DROP TABLE "nucleo_familiar"`);
    await queryRunner.query(`ALTER TABLE "nucleo_familiar_temp" RENAME TO "nucleo_familiar"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate without FK constraint
    await queryRunner.query(`
      CREATE TABLE "nucleo_familiar_temp" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "titular_id" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`INSERT INTO "nucleo_familiar_temp" SELECT "id", "titular_id", "created_at" FROM "nucleo_familiar"`);
    await queryRunner.query(`DROP TABLE "nucleo_familiar"`);
    await queryRunner.query(`ALTER TABLE "nucleo_familiar_temp" RENAME TO "nucleo_familiar"`);
  }
}
