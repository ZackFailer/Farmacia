import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuplidaToPacienteNecesidad1741708800000 implements MigrationInterface {
  name = 'AddSuplidaToPacienteNecesidad1741708800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "paciente_necesidad" ADD COLUMN "suplida" boolean NOT NULL DEFAULT (0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente_necesidad" ADD COLUMN "fecha_suplida" datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente_necesidad" ADD COLUMN "suplida_por_id" integer NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente_necesidad" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)`,
    );
    await queryRunner.query(
      `ALTER TABLE "paciente_necesidad" ADD COLUMN "created_at" datetime NOT NULL DEFAULT (datetime('now'))`,
    );
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // SQLite no soporta DROP COLUMN simple.
    // Para revertir: restaurar desde backup.
  }
}
