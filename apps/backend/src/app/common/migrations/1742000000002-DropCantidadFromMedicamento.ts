import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCantidadFromMedicamento1742000000002 implements MigrationInterface {
  name = 'DropCantidadFromMedicamento1742000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "medicamento" DROP COLUMN "cantidad"`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Not implemented
  }
}
