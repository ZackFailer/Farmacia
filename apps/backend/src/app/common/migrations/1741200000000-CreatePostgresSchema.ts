import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostgresSchema1741200000000 implements MigrationInterface {
  name = 'CreatePostgresSchema1741200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1. usuario
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "usuario" (
      "id" SERIAL PRIMARY KEY,
      "username" VARCHAR(50) NOT NULL,
      "nombre" VARCHAR(120) NOT NULL,
      "rol" VARCHAR(20) NOT NULL,
      "pin_hash" VARCHAR(255) NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "created_by_id" INTEGER,
      CONSTRAINT "UQ_usuario_username" UNIQUE ("username")
    )`);

    // 2. medicamento
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "medicamento" (
      "id" SERIAL PRIMARY KEY,
      "nombre_generico" VARCHAR(120) NOT NULL,
      "nombre_comercial" VARCHAR(120),
      "presentacion" VARCHAR(80) NOT NULL,
      "concentracion" DOUBLE PRECISION NOT NULL,
      "unidad_concentracion" VARCHAR(10) NOT NULL DEFAULT 'mg',
      "es_vital" BOOLEAN NOT NULL DEFAULT FALSE,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER
    )`);

    // 3. paciente
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "paciente" (
      "id" SERIAL PRIMARY KEY,
      "id_emergencia" VARCHAR(60) NOT NULL,
      "nombre" VARCHAR(120) NOT NULL,
      "apellido" VARCHAR(120) NOT NULL,
      "cedula" VARCHAR(30),
      "telefono" VARCHAR(20),
      "sexo" VARCHAR(1) NOT NULL,
      "edad_estimada" INTEGER NOT NULL,
      "fecha_nacimiento" VARCHAR(10),
      "edad_manual" INTEGER,
      "es_recien_nacido" BOOLEAN NOT NULL DEFAULT FALSE,
      "peso_estimado" DOUBLE PRECISION NOT NULL,
      "es_damnificado" BOOLEAN NOT NULL DEFAULT FALSE,
      "tiene_carga_familiar" BOOLEAN NOT NULL DEFAULT FALSE,
      "tiene_discapacidad_motora" BOOLEAN NOT NULL DEFAULT FALSE,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "situacion_vivienda" VARCHAR(20) NOT NULL DEFAULT 'no_afectado',
      "updated_at" TIMESTAMP,
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER
    )`);

    // 4. catalogo_patologia
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "catalogo_patologia" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(120) NOT NULL,
      "descripcion" VARCHAR(255),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP,
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER
    )`);

    // 5. catalogo_necesidad
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "catalogo_necesidad" (
      "id" SERIAL PRIMARY KEY,
      "nombre" VARCHAR(120) NOT NULL,
      "descripcion" VARCHAR(255),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP,
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER
    )`);

    // 6. lote
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "lote" (
      "id" SERIAL PRIMARY KEY,
      "medicamento_id" INTEGER NOT NULL,
      "codigo_qr" VARCHAR(100) NOT NULL,
      "cantidad_inicial" INTEGER NOT NULL,
      "cantidad_actual" INTEGER NOT NULL,
      "fecha_vencimiento" DATE NOT NULL,
      "donante" VARCHAR(120),
      "ubicacion" VARCHAR(120),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "FK_lote_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE RESTRICT
    )`);

    // 7. lote_movimiento
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "lote_movimiento" (
      "id" SERIAL PRIMARY KEY,
      "lote_id" INTEGER NOT NULL,
      "tipo" VARCHAR(20) NOT NULL,
      "cantidad" INTEGER NOT NULL,
      "motivo" VARCHAR(255),
      "usuario_id" INTEGER,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "FK_lote_movimiento_lote" FOREIGN KEY ("lote_id") REFERENCES "lote"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_lote_movimiento_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL
    )`);

    // 8. configuracion
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "configuracion" (
      "id" SERIAL PRIMARY KEY,
      "medicamento_id" INTEGER NOT NULL,
      "umbral_minimo" INTEGER NOT NULL DEFAULT 10,
      "dosis_maxima_mg_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "peso_referencia_kg" DOUBLE PRECISION NOT NULL DEFAULT 70,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "created_at" TIMESTAMP,
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER,
      CONSTRAINT "UQ_configuracion_medicamento" UNIQUE ("medicamento_id"),
      CONSTRAINT "FK_configuracion_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE CASCADE
    )`);

    // 9. nucleo_familiar
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "nucleo_familiar" (
      "id" SERIAL PRIMARY KEY,
      "codigo_carpa" VARCHAR(20),
      "ubicacion" VARCHAR(200),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "titular_id" INTEGER,
      "updated_at" TIMESTAMP,
      "created_by_id" INTEGER,
      "updated_by_id" INTEGER,
      CONSTRAINT "FK_nucleo_familiar_titular" FOREIGN KEY ("titular_id") REFERENCES "paciente"("id") ON DELETE NO ACTION
    )`);

    // 10. nucleo_familiar_miembro
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "nucleo_familiar_miembro" (
      "id" SERIAL PRIMARY KEY,
      "nucleo_id" INTEGER NOT NULL,
      "paciente_id" INTEGER NOT NULL,
      "relacion" VARCHAR(30) NOT NULL,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_by_id" INTEGER,
      CONSTRAINT "UQ_nucleo_familiar_miembro_paciente" UNIQUE ("paciente_id"),
      CONSTRAINT "FK_nucleo_familiar_miembro_nucleo" FOREIGN KEY ("nucleo_id") REFERENCES "nucleo_familiar"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_nucleo_familiar_miembro_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE NO ACTION
    )`);

    // 11. receta
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "receta" (
      "id" SERIAL PRIMARY KEY,
      "paciente_id" INTEGER NOT NULL,
      "doctor_id" INTEGER NOT NULL,
      "fecha_hora" TIMESTAMP NOT NULL,
      "estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "motivo" VARCHAR(500),
      CONSTRAINT "FK_receta_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_receta_doctor" FOREIGN KEY ("doctor_id") REFERENCES "usuario"("id") ON DELETE RESTRICT
    )`);

    // 12. receta_detalle
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "receta_detalle" (
      "id" SERIAL PRIMARY KEY,
      "receta_id" INTEGER NOT NULL,
      "medicamento_id" INTEGER NOT NULL,
      "cantidad_recetada" INTEGER,
      "dias" INTEGER,
      "dosis_indicada" VARCHAR(255),
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "FK_receta_detalle_receta" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_receta_detalle_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE RESTRICT
    )`);

    // 13. dispensacion
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "dispensacion" (
      "id" SERIAL PRIMARY KEY,
      "paciente_id" INTEGER NOT NULL,
      "usuario_id" INTEGER NOT NULL,
      "fecha_hora" TIMESTAMP NOT NULL,
      "observaciones" TEXT,
      "receta_id" INTEGER,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      CONSTRAINT "FK_dispensacion_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_dispensacion_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_dispensacion_receta" FOREIGN KEY ("receta_id") REFERENCES "receta"("id") ON DELETE SET NULL
    )`);

    // 14. dispensacion_detalle
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "dispensacion_detalle" (
      "id" SERIAL PRIMARY KEY,
      "dispensacion_id" INTEGER NOT NULL,
      "lote_id" INTEGER,
      "medicamento_id" INTEGER NOT NULL,
      "cantidad" INTEGER NOT NULL,
      "dosis_mg_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT "FK_dispensacion_detalle_dispensacion" FOREIGN KEY ("dispensacion_id") REFERENCES "dispensacion"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_dispensacion_detalle_lote" FOREIGN KEY ("lote_id") REFERENCES "lote"("id") ON DELETE RESTRICT,
      CONSTRAINT "FK_dispensacion_detalle_medicamento" FOREIGN KEY ("medicamento_id") REFERENCES "medicamento"("id") ON DELETE RESTRICT
    )`);

    // 15. paciente_patologia
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "paciente_patologia" (
      "id" SERIAL PRIMARY KEY,
      "paciente_id" INTEGER NOT NULL,
      "patologia_id" INTEGER NOT NULL,
      "tratamiento" VARCHAR(255),
      "created_by_id" INTEGER,
      CONSTRAINT "FK_paciente_patologia_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_paciente_patologia_patologia" FOREIGN KEY ("patologia_id") REFERENCES "catalogo_patologia"("id") ON DELETE CASCADE
    )`);

    // 16. paciente_necesidad
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "paciente_necesidad" (
      "id" SERIAL PRIMARY KEY,
      "paciente_id" INTEGER NOT NULL,
      "necesidad_id" INTEGER NOT NULL,
      "suplida" BOOLEAN NOT NULL DEFAULT FALSE,
      "fecha_suplida" TIMESTAMP,
      "suplida_por_id" INTEGER,
      "activo" BOOLEAN NOT NULL DEFAULT TRUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "created_by_id" INTEGER,
      CONSTRAINT "FK_paciente_necesidad_paciente" FOREIGN KEY ("paciente_id") REFERENCES "paciente"("id") ON DELETE CASCADE,
      CONSTRAINT "FK_paciente_necesidad_necesidad" FOREIGN KEY ("necesidad_id") REFERENCES "catalogo_necesidad"("id") ON DELETE CASCADE
    )`);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // No implementado
  }
}
