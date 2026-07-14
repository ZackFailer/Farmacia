import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParametroSistema1742100000003 implements MigrationInterface {
  name = 'CreateParametroSistema1742100000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE parametro_sistema (
        id SERIAL PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      INSERT INTO parametro_sistema (clave, valor) VALUES ('hora_cierre', '18:00')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE parametro_sistema`);
  }
}
