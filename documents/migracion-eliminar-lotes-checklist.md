# Plan de Implementación — Eliminación de Lotes como unidad operativa

> **Objetivo**: Eliminar la dependencia operativa de lotes. Los medicamentos pasan a ser la unidad directa de dispensación sin stock ni lotes. Se agrega trazabilidad completa (createdBy/updatedBy) a todas las entidades funcionales. Las tablas `lote` y `lote_movimiento` se conservan en BD como histórico.

---

## Decisiónes funcionales acordadas

| Decisión | Valor |
|---|---|
| Stock en medicamentos | No. Los medicamentos solo existen como catálogo. No se contabiliza ingreso. |
| Qué se contabiliza | Solo egreso (dispensación). Cada dispensación es la unidad de medida. |
| Lotes históricos | Se mantienen en BD pero no se usan operativamente. |
| Métricas | Página separada `/inventario/metricas`. |
| Dosis en dispensación | El farmacéutico decide la cantidad al dispensar. |
| Receta del doctor | El doctor solo selecciona medicamentos sin indicar cantidad. |

---

## Fase 0: Diagnóstico y Backup

- [ ] **Verificar estado actual del proyecto**
  ```bash
  npx nx show project backend
  npx nx show project frontend
  ```
  Confirmar que compila y arranca correctamente antes de tocar nada.

- [ ] **Backup completo de la BD**
  ```bash
  copy apps\backend\data\farmacia.sqlite apps\backend\data\farmacia.sqlite.backup-2026-07-09-prelotes
  ```

- [ ] **Detener el backend** si está corriendo.

- [ ] **Backup de entidades** (opcional — snapshot del código actual)
  ```bash
  copy apps\backend\src\app\common\entities apps\backend\src\app\common\entities-backup /E /I
  ```

---

## Fase 1: Entidades — Trazabilidad (createdBy / updatedBy)

Agregar campos de auditoría a todas las entidades funcionales que no los tienen.

### 1.1 Medicamento

- [ ] **Editar `apps/backend/src/app/common/entities/medicamento.entity.ts`**
  - Agregar:
    ```typescript
    @Column({ nullable: true })
    createdById?: number;
    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'created_by_id' })
    createdBy?: Usuario;

    @Column({ nullable: true })
    updatedById?: number;
    @ManyToOne(() => Usuario, { nullable: true })
    @JoinColumn({ name: 'updated_by_id' })
    updatedBy?: Usuario;
    ```

### 1.2 Paciente

- [ ] **Editar `apps/backend/src/app/common/entities/paciente.entity.ts`**
  - Agregar `updatedAt` (si no existe `@UpdateDateColumn`)
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

### 1.3 NucleoFamiliar

- [ ] **Editar `apps/backend/src/app/common/entities/nucleo-familiar.entity.ts`**
  - Agregar `updatedAt`
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

### 1.4 NucleoFamiliarMiembro

- [ ] **Editar `apps/backend/src/app/common/entities/nucleo-familiar-miembro.entity.ts`**
  - Agregar `createdById`, `createdBy`

### 1.5 PacientePatologia

- [ ] **Editar `apps/backend/src/app/common/entities/paciente-patologia.entity.ts`**
  - Agregar `createdById`, `createdBy`

### 1.6 Configuracion

- [ ] **Editar `apps/backend/src/app/common/entities/configuracion.entity.ts`**
  - Agregar `createdAt`
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

### 1.7 Usuario

- [ ] **Editar `apps/backend/src/app/common/entities/usuario.entity.ts`**
  - Agregar `createdAt`
  - Agregar `createdById`, `createdBy`

### 1.8 CatalogoPatologia

- [ ] **Editar `apps/backend/src/app/common/entities/catalogo-patologia.entity.ts`**
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

### 1.9 CatalogoNecesidad

- [ ] **Editar `apps/backend/src/app/common/entities/catalogo-necesidad.entity.ts`**
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

### 1.10 Carpa

- [ ] **Editar `apps/backend/src/app/common/entities/carpa.entity.ts`**
  - Agregar `createdById`, `createdBy`, `updatedById`, `updatedBy`

---

## Fase 2: Entidades — Simplificación operativa

- [ ] **Editar `apps/backend/src/app/common/entities/dispensacion-detalle.entity.ts`**
  - Hacer `loteId` nullable: `@Column({ nullable: true }) loteId?: number;`
  - Hacer la relación ManyToOne opcional

- [ ] **Editar `apps/backend/src/app/common/entities/receta-detalle.entity.ts`**
  - Hacer `cantidadRecetada` nullable: `@Column({ nullable: true }) cantidadRecetada?: number;`

---

## Fase 3: Migración SQL

- [ ] **Crear archivo**: `apps/backend/src/app/common/migrations/{timestamp}-EliminarLotesYAgregarTrazabilidad.ts`

  ```typescript
  import { MigrationInterface, QueryRunner } from 'typeorm';

  export class EliminarLotesYAgregarTrazabilidad{timestamp} implements MigrationInterface {
    name = 'EliminarLotesYAgregarTrazabilidad{timestamp}';

    async up(queryRunner: QueryRunner): Promise<void> {
      // Trazabilidad - Medicamento
      await queryRunner.query(`ALTER TABLE "medicamento" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "medicamento" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - Paciente
      await queryRunner.query(`ALTER TABLE "paciente" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "paciente" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - NucleoFamiliar
      await queryRunner.query(`ALTER TABLE "nucleo_familiar" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "nucleo_familiar" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - NucleoFamiliarMiembro
      await queryRunner.query(`ALTER TABLE "nucleo_familiar_miembro" ADD COLUMN "created_by_id" integer NULL`);

      // Trazabilidad - PacientePatologia
      await queryRunner.query(`ALTER TABLE "paciente_patologia" ADD COLUMN "created_by_id" integer NULL`);

      // Trazabilidad - Configuracion
      await queryRunner.query(`ALTER TABLE "configuracion" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "configuracion" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - Usuario
      await queryRunner.query(`ALTER TABLE "usuario" ADD COLUMN "created_by_id" integer NULL`);

      // Trazabilidad - CatalogoPatologia
      await queryRunner.query(`ALTER TABLE "catalogo_patologia" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "catalogo_patologia" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - CatalogoNecesidad
      await queryRunner.query(`ALTER TABLE "catalogo_necesidad" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "catalogo_necesidad" ADD COLUMN "updated_by_id" integer NULL`);

      // Trazabilidad - Carpa
      await queryRunner.query(`ALTER TABLE "carpa" ADD COLUMN "created_by_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "carpa" ADD COLUMN "updated_by_id" integer NULL`);

      // Simplificación - Hacer lote_id nullable en dispensacion_detalle
      // SQLite no soporta ALTER COLUMN. Se recrea la tabla.
      await queryRunner.query(`
        CREATE TABLE "dispensacion_detalle_temp" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "dispensacion_id" integer NOT NULL,
          "lote_id" integer NULL,
          "medicamento_id" integer NOT NULL,
          "cantidad" integer NOT NULL,
          "dosis_mg_kg" real NOT NULL DEFAULT (0),
          "activo" boolean NOT NULL DEFAULT (1),
          "created_at" datetime NOT NULL DEFAULT (datetime('now'))
        )
      `);
      await queryRunner.query(`INSERT INTO "dispensacion_detalle_temp" SELECT * FROM "dispensacion_detalle"`);
      await queryRunner.query(`DROP TABLE "dispensacion_detalle"`);
      await queryRunner.query(`ALTER TABLE "dispensacion_detalle_temp" RENAME TO "dispensacion_detalle"`);
      await queryRunner.query(`CREATE INDEX "IDX_dispensacion_detalle_dispensacion" ON "dispensacion_detalle" ("dispensacion_id")`);

      // Simplificación - Hacer cantidad_recetada nullable en receta_detalle
      await queryRunner.query(`
        CREATE TABLE "receta_detalle_temp" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "receta_id" integer NOT NULL,
          "medicamento_id" integer NOT NULL,
          "cantidad_recetada" integer NULL,
          "dias" integer NULL,
          "dosis_indicada" varchar NULL,
          "activo" boolean NOT NULL DEFAULT (1),
          "created_at" datetime NOT NULL DEFAULT (datetime('now'))
        )
      `);
      await queryRunner.query(`INSERT INTO "receta_detalle_temp" SELECT * FROM "receta_detalle"`);
      await queryRunner.query(`DROP TABLE "receta_detalle"`);
      await queryRunner.query(`ALTER TABLE "receta_detalle_temp" RENAME TO "receta_detalle"`);
      await queryRunner.query(`CREATE INDEX "IDX_receta_detalle_receta" ON "receta_detalle" ("receta_id")`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
      // No implementado por seguridad de datos históricos
    }
  }
  ```

- [ ] **Registrar migración en `app.module.ts`**
  - Agregar al array `migrations: [...]`
  - Mantener la migración anterior de suplida

- [ ] **Ejecutar migración**
  ```bash
  npm run migration:run
  ```

- [ ] **Verificar**
  ```bash
  npm run migration:show
  node -e "
  const {join} = require('path');
  const {DatabaseSync} = require('node:sqlite');
  const conn = new DatabaseSync(join('apps', 'backend', 'data', 'farmacia.sqlite'));
  const info = conn.prepare(\"PRAGMA table_info(dispensacion_detalle)\").all();
  console.log(info.map(r => r.name + ' (' + r.type + ')').join('\\n'));
  conn.close();
  "
  ```
  Verificar que `lote_id` aparece como nullable.

---

## Fase 4: Backend — Eliminar endpoints de lotes

- [ ] **Editar `apps/backend/src/app/recepcion/recepcion.controller.ts`**
  - Eliminar todos los endpoints de `/lotes`:
    - `GET /lotes`
    - `POST /lotes`
    - `PATCH /lotes/:id`
    - `DELETE /lotes/:id`
    - `GET /lotes/qr/:codigo`
    - `GET /lotes/:id`
    - `GET /lotes/:id/qr`

- [ ] **Editar `apps/backend/src/app/recepcion/recepcion.service.ts`**
  - Eliminar métodos:
    - `getLotes()`
    - `createLote()`
    - `updateLote()`
    - `deleteLote()`
    - `getLoteById()`
    - `getLoteByQR()`
    - `getLoteQr()`
  - Eliminar importaciones de `Lote`, `LoteMovimiento`, `uuid`

- [ ] **Editar `apps/backend/src/app/recepcion/recepcion.module.ts`**
  - Eliminar `Lote` y `LoteMovimiento` de `TypeOrmModule.forFeature()`

- [ ] **Editar `apps/backend/src/app/inventario/inventario.controller.ts`**
  - Eliminar:
    - `PATCH /lotes/:id/ajustar-stock`
    - `GET /lotes/:id/movimientos`

- [ ] **Editar `apps/backend/src/app/inventario/inventario.service.ts`**
  - Eliminar:
    - `ajustarStock()`
    - `getMovimientosLote()`
    - `getProximosVencer()`
  - Simplificar `getInventario()`: eliminar agregación sobre lotes, devolver solo medicamentos + configuraciones

- [ ] **Editar `apps/backend/src/app/inventario/inventario.module.ts`**
  - Eliminar `Lote` y `LoteMovimiento` de `TypeOrmModule.forFeature()`

- [ ] **Editar `apps/backend/src/app/dispensacion/dispensacion.controller.ts`**
  - Eliminar `GET /lotes/disponibles/:medicamentoId`

- [ ] **Editar `apps/backend/src/app/dispensacion/dispensacion.service.ts`**
  - Eliminar `getLotesDisponibles()`
  - Eliminar toda lógica FEFO en `crearDispensacion()`
  - Eliminar importaciones de `Lote`, `LessThan`, `LoteMovimiento`

- [ ] **Editar `apps/backend/src/app/dispensacion/dispensacion.module.ts`**
  - Eliminar `Lote` y `LoteMovimiento` de `TypeOrmModule.forFeature()`

- [ ] **Editar `apps/backend/src/app/app.module.ts`**
  - Eliminar `Lote`, `LoteMovimiento` del array de entidades en TypeORM

---

## Fase 5: Backend — Modificar endpoints existentes

- [ ] **Editar `apps/backend/src/app/dispensacion/dispensacion.service.ts` — `crearDispensacion()`**
  - Eliminar validación FEFO
  - Eliminar decremento de `lote.cantidadActual`
  - Eliminar creación de `LoteMovimiento`
  - Los detalles ahora solo contienen `medicamentoId` y `cantidad` (sin `loteId`)
  - Actualizar `CreateDispensacionDetalleDto`:
    ```typescript
    // Se elimina loteId del DTO
    export class CreateDispensacionDetalleDto {
      @IsInt()
      @IsPositive()
      medicamentoId: number;

      @IsInt()
      @IsPositive()
      cantidad: number;
    }
    ```

- [ ] **Editar `apps/backend/src/app/inventario/inventario.service.ts` — `getInventario()`**
  - Simplificar para devolver medicamentos con su configuración
  - Eliminar lógica de lotes (SUM, MIN, GROUP BY)
  - Respuesta ya no incluye `stockTotal`, `proximoVencimiento`, `cantidadLotes`
  - Opcional: agregar campo `ultimaDispensacion` (fecha del último movimiento)

- [ ] **Editar `apps/backend/src/app/inventario/inventario.controller.ts`**
  - Actualizar para reflejar nuevo tipo de respuesta

- [ ] **Editar `apps/backend/src/app/common/entities/dispensacion-detalle.entity.ts`**
  - Eliminar la relación con Lote (o dejarla como nullable)

---

## Fase 6: Backend — Nuevo endpoint de métricas

- [ ] **Crear DTO**: `apps/backend/src/app/inventario/dto/metricas-inventario.dto.ts`

  ```typescript
  export interface EgresoPorDia {
    fecha: string;
    total: number;
  }

  export interface MedicamentoMasDispensado {
    medicamento: string;
    medicamentoId: number;
    totalDosis: number;
    pacientes: number;
  }

  export interface MetricasInventario {
    pacientesAtendidosTotal: number;
    pacientesAtendidosHoy: number;
    pacientesAtendidosSemana: number;
    dosisTotales: number;
    promedioDosisPorDia: number;
    egresosPorDia: EgresoPorDia[];
    medicamentosMasDispensados: MedicamentoMasDispensado[];
    medicamentosSinMovimientos: { id: number; nombre: string; ultimaDispensacion?: string }[];
    totalMedicamentos: number;
  }
  ```

- [ ] **Agregar método `getMetricas()` en `InventarioService`**

  ```typescript
  async getMetricas(): Promise<MetricasInventario> {
    // Pacientes atendidos (distinct de dispensacion)
    // Dosis totales (SUM de cantidad en dispensacion_detalle)
    // Egresos por día (GROUP BY fecha)
    // Top medicamentos dispensados
    // Medicamentos sin movimientos en últimos 30 días
  }
  ```

- [ ] **Agregar endpoint en `InventarioController`**

  ```typescript
  @Get('metricas')
  @Roles(Role.FARMACEUTICO, Role.ADMIN)
  async getMetricas(): Promise<MetricasInventario> {
    return this.inventarioService.getMetricas();
  }
  ```

---

## Fase 7: Backend — Inyectar trazabilidad en servicios

- [ ] **Agregar `@CurrentUser()` en controllers donde falte:**
  - `POST /medicamentos` → pasar `user.userId` como `createdById`
  - `PATCH /medicamentos/:id` → pasar `user.userId` como `updatedById`
  - `POST /pacientes` → pasar `user.userId` como `createdById`
  - `PATCH /pacientes/:id` → pasar `user.userId` como `updatedById`
  - `POST /nucleo-familiar` → pasar `user.userId` como `createdById`
  - `POST /dispensaciones` → ya tiene `usuarioId` ✅
  - `POST /recetas` → ya tiene `doctorId` ✅
  - `POST /censo/carpas` → pasar `user.userId` como `createdById`
  - `POST /usuarios` → pasar `user.userId` como `createdById`
  - `PATCH /configuraciones/:id` → pasar `user.userId` como `updatedById`
  - `POST /patologias`, `PATCH /patologias/:id` → pasar `createdById`/`updatedById`
  - `POST /necesidades`, `PATCH /necesidades/:id` → pasar `createdById`/`updatedById`

- [ ] **Actualizar servicios para persistir los campos de auditoría**

---

## Fase 8: Frontend — Recepción

- [ ] **Eliminar `DashboardIngresosPage`** (o redirigir a catálogo de medicamentos)
  - Archivos: `apps/frontend/src/app/recepcion/pages/dashboard-ingresos.page.ts`
  - Rutas: eliminar `/recepcion` del router

- [ ] **Eliminar componentes de recepción que ya no aplican:**
  - `apps/frontend/src/app/recepcion/components/tabla-ingresos.component.ts`
  - `apps/frontend/src/app/recepcion/modals/ingreso-lote.modal.ts`
  - `apps/frontend/src/app/recepcion/modals/imprimir-etiqueta.modal.ts`

- [ ] **Eliminar métodos de lotes en `RecepcionService`:**
  - `getLotes()`, `crearLote()`, `actualizarLote()`, `getLoteById()`, `getLoteQR()`
  - Eliminar de: `recepcion.service.ts`, `recepcion.service.api.ts`, `recepcion.service.mock.ts`

- [ ] **Actualizar `CatalogoMedicamentosPage`**: mantener como está (solo CRUD de medicamentos)

- [ ] **Actualizar rutas**: eliminar `/recepcion` del menú lateral y del router

---

## Fase 9: Frontend — Recetas (Doctor)

- [ ] **Editar `apps/frontend/src/app/recetas/pages/recetar.page.ts`**
  - Eliminar el campo de input para `cantidad_recetada` por cada medicamento seleccionado
  - El DTO ya no envía `cantidad_recetada` (o envía `null`)

- [ ] **Actualizar modelos de receta en frontend**
  - `CreateRecetaDetalleDto`: hacer `cantidad_recetada` opcional

---

## Fase 10: Frontend — Dispensación (Farmacia)

- [ ] **Editar `apps/frontend/src/app/dispensacion/pages/seleccionar-medicamentos.page.ts`**
  - Eliminar todo el código de selección de lotes (QR scan, dropdown de lotes)
  - Para cada medicamento de la receta: mostrar nombre + input numérico para cantidad
  - El farmacéutico ingresa la cantidad manualmente
  - Eliminar llamadas a `getLotesDisponibles()` y `getLoteByQR()`

- [ ] **Editar `apps/frontend/src/app/dispensacion/modals/busqueda-medicamento.modal.ts`**
  - Simplificar: solo busca medicamento + input de cantidad
  - Eliminar action sheet de selección de lote
  - Eliminar validación de stock

- [ ] **Editar `apps/frontend/src/app/dispensacion/pages/confirmar-entrega.page.ts`**
  - Eliminar visualización de código de lote en el resumen
  - Simplificar items a: medicamento + cantidad + dosis calculada

- [ ] **Editar `apps/frontend/src/app/dispensacion/services/dispensacion.service.ts`**
  - Eliminar `getLotesDisponibles()`, `getLoteByQR()`
  - `crearDispensacion()` ya no incluye `lote_id` en detalles

- [ ] **Editar `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`**
  - Actualizar mappers: eliminar `toLote()`
  - Limpiar el DTO de creación

- [ ] **Editar `apps/frontend/src/app/dispensacion/services/dispensacion.service.mock.ts`**
  - Eliminar `SEED_LOTES`, toda la lógica FEFO

- [ ] **Eliminar componentes que ya no aplican:**
  - `apps/frontend/src/app/dispensacion/modals/validacion-dosis.modal.ts` (opcional, se puede mantener si aún valida dosis)
  - Revisar si `resumen-receta.component.ts` necesita cambios

---

## Fase 11: Frontend — Inventario

### 11.1 PanelStockPage

- [ ] **Editar `apps/frontend/src/app/inventario/pages/panel-stock.page.ts`**
  - Eliminar columna/indicador de stock, cantidad de lotes, próximo a vencer
  - Eliminar `lotesCache` y su carga
  - Simplificar a: lista de medicamentos con su umbral y configuración
  - Eliminar botón "Ver lotes" que abría `DetalleLoteModal`

- [ ] **Eliminar modales de inventario que ya no aplican:**
  - `apps/frontend/src/app/inventario/modals/detalle-lote.modal.ts`
  - `apps/frontend/src/app/inventario/modals/ajuste-stock.modal.ts`

- [ ] **Editar `apps/frontend/src/app/inventario/components/tarjeta-medicamento.component.ts`**
  - Eliminar meta-chips de lotes (`cantidad_lotes`, `proximo_vencer`)
  - Eliminar borde izquierdo de color (ya no hay stock que indicar)
  - Opcional: mostrar indicador de actividad (última dispensación)

- [ ] **Eliminar métodos de lotes en `InventarioService`:**
  - `getProximosVencer()`, `ajustarStock()`, `getMovimientosLote()`
  - Eliminar de: `inventario.service.ts`, `inventario.service.api.ts`, `inventario.service.mock.ts`

### 11.2 MetricasInventarioPage (NUEVA)

- [ ] **Crear página**: `apps/frontend/src/app/inventario/pages/metricas-inventario.page.ts`

  ```html
  <ion-header>
    <ion-toolbar color="primary">
      <ion-buttons slot="start">
        <ion-back-button defaultHref="/inventario"></ion-back-button>
      </ion-buttons>
      <ion-title>Métricas</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <!-- Tarjetas de resumen -->
    <ion-grid>
      <ion-row>
        <ion-col size="6">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ metricas().pacientesAtendidosTotal }}</ion-card-title>
              <ion-card-subtitle>Pacientes totales</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </ion-col>
        <ion-col size="6">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ metricas().pacientesAtendidosHoy }}</ion-card-title>
              <ion-card-subtitle>Pacientes hoy</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col size="6">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ metricas().dosisTotales }}</ion-card-title>
              <ion-card-subtitle>Dosis totales</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </ion-col>
        <ion-col size="6">
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ metricas().promedioDosisPorDia | number:'1.1-1' }}</ion-card-title>
              <ion-card-subtitle>Promedio dosis/día</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </ion-col>
      </ion-row>
    </ion-grid>

    <!-- Gráfico de egresos por día -->
    <ion-list-header>
      <ion-label>Egresos por día (últimos 7)</ion-label>
    </ion-list-header>
    <ion-list>
      <ion-item *ngFor="let d of metricas().egresosPorDia">
        <ion-label>{{ d.fecha }}</ion-label>
        <ion-note slot="end">{{ d.total }} dosis</ion-note>
      </ion-item>
    </ion-list>

    <!-- Top medicamentos dispensados -->
    <ion-list-header>
      <ion-label>Medicamentos más dispensados</ion-label>
    </ion-list-header>
    <ion-list>
      <ion-item *ngFor="let m of metricas().medicamentosMasDispensados">
        <ion-label>
          <h2>{{ m.medicamento }}</h2>
          <p>{{ m.pacientes }} pacientes</p>
        </ion-label>
        <ion-note slot="end">{{ m.totalDosis }} dosis</ion-note>
      </ion-item>
    </ion-list>

    <!-- Medicamentos sin movimientos -->
    @if (metricas().medicamentosSinMovimientos.length > 0) {
      <ion-list-header color="warning">
        <ion-label>Sin movimientos recientes</ion-label>
      </ion-list-header>
      <ion-list>
        <ion-item *ngFor="let m of metricas().medicamentosSinMovimientos">
          <ion-label>{{ m.nombre }}</ion-label>
          <ion-note slot="end">{{ m.ultimaDispensacion ? 'Últ: ' + m.ultimaDispensacion : 'Nunca' }}</ion-note>
        </ion-item>
      </ion-list>
    }
  </ion-content>
  ```

- [ ] **Agregar método `getMetricas()` en `InventarioService`:**
  ```typescript
  abstract getMetricas(): Observable<MetricasInventario>;
  ```

- [ ] **Implementar en `ApiInventarioService`:**
  ```typescript
  getMetricas(): Observable<MetricasInventario> {
    return this.http.get<MetricasInventario>(`${API_BASE_URL}/inventario/metricas`);
  }
  ```

- [ ] **Agregar ruta** en `inventario.routes.ts`:
  ```typescript
  { path: 'metricas', loadComponent: () => import('./pages/metricas-inventario.page').then(m => m.MetricasInventarioPage) }
  ```

- [ ] **Agregar enlace** en el menú lateral y/o en `PanelStockPage` como botón "Ver métricas"

- [ ] **Crear modelo frontend**: `apps/frontend/src/app/shared/models/metricas-inventario.model.ts`

---

## Fase 12: Frontend — Historial

- [ ] **Editar `apps/frontend/src/app/historial/pages/historial-paciente.page.ts`**
  - Eliminar visualización de código de lote por item de dispensación

- [ ] **Editar `apps/frontend/src/app/historial/modals/detalle-dispensacion.modal.ts`**
  - Eliminar columna/referencia a lote
  - Mostrar solo medicamento + cantidad + dosis

- [ ] **Editar `apps/frontend/src/app/historial/services/historial.service.api.ts`**
  - Eliminar `ApiLote` y su mapper en la respuesta

- [ ] **Editar `apps/frontend/src/app/historial/services/historial.service.mock.ts`**
  - Eliminar datos de lote de seed

---

## Fase 13: Frontend — Limpieza general

- [ ] **Eliminar modelo `Lote` del frontend** (o dejarlo como histórico):
  - `apps/frontend/src/app/shared/models/lote.model.ts` — marcar como deprecated, no eliminar por si se necesita para históricos

- [ ] **Eliminar importaciones obsoletas** en todos los archivos modificados

- [ ] **Verificar que no queden referencias a lote en templates:**
  ```bash
  rg -l "lote" apps/frontend/src/app/ --type ts --type html
  ```
  Solo deberían quedar referencias en modelos históricos y en código legacy marcado.

- [ ] **Actualizar modelos de dispensación:**
  - `CreateDispensacionDetalleDto`: eliminar `lote_id`
  - `DispensacionDetalle`: hacer `lote_id` opcional

---

## Fase 14: Compilación y verificación

- [ ] **Compilar backend**
  ```bash
  npx nx build backend
  ```

- [ ] **Compilar frontend**
  ```bash
  npx nx build frontend --configuration=development
  ```

- [ ] **Corregir errores de compilación** (importaciones, tipos, templates)

- [ ] **Iniciar backend y probar**
  ```bash
  npx nx serve backend
  ```
  Verificar que arranca sin errores

- [ ] **Probar endpoints clave:**
  - `GET /api/v1/medicamentos` — debe responder sin errores
  - `GET /api/v1/inventario` — debe responder sin datos de lotes
  - `GET /api/v1/inventario/metricas` — debe responder con métricas
  - `POST /api/v1/dispensaciones` — crear dispensación sin lote_id

- [ ] **Iniciar frontend y probar visualmente**
  ```bash
  npx nx serve frontend
  ```
  - Verificar que recetas no piden cantidad
  - Verificar que dispensación no muestra lotes
  - Verificar que métricas de inventario funcionan

---

## Fase de Contingencia (rollback)

Si algo sale mal:

- [ ] **Detener backend**
- [ ] **Restaurar BD desde backup**:
  ```bash
  copy /Y apps\backend\data\farmacia.sqlite.backup-2026-07-09-prelotes apps\backend\data\farmacia.sqlite
  ```
- [ ] **Revertir cambios en entidades** usando git:
  ```bash
  git checkout -- apps/backend/src/app/common/entities/
  ```
- [ ] **Revertir cambios en servicios y controladores**:
  ```bash
  git checkout -- apps/backend/src/app/recepcion/
  git checkout -- apps/backend/src/app/inventario/
  git checkout -- apps/backend/src/app/dispensacion/
  git checkout -- apps/backend/src/app/app.module.ts
  ```
- [ ] **Revertir cambios en frontend**:
  ```bash
  git checkout -- apps/frontend/src/app/
  ```
- [ ] **Reiniciar backend** y verificar que funciona con datos anteriores
