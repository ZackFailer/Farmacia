# Plan de Implementación — Checklist de Migración

> **Objetivo**: Agregar trazabilidad de cumplimiento a necesidades (checklist suplida) y habilitar asignación de patologías/necesidades en todo paciente, usando migraciones TypeORM sin pérdida de datos.

---

## Fase 0: Diagnóstico y Backup Inicial ✅

- [x] **Verificar estado actual de la BD**
  ```bash
  dir apps\backend\data\
  dir dist\apps\backend\data\
  ```
  Confirmar que la BD con datos reales está en `dist\apps\backend\data\farmacia.sqlite`.

- [x] **Backup completo de la BD real**
  ```bash
  copy dist\apps\backend\data\farmacia.sqlite apps\backend\data\farmacia.sqlite.backup-2026-07-09-prealta
  copy dist\apps\backend\data\farmacia.sqlite-wal apps\backend\data\farmacia.sqlite-wal.backup-2026-07-09
  ```

- [x] **Detener el backend** si está corriendo.

---

## Fase 1: Unificar ubicación de la BD ✅

Migrar la BD real desde `dist/` hacia `apps/backend/data/` (ubicación estable fuera del build).

- [x] **Copiar la BD real a la ubicación estable**
  ```bash
  copy /Y dist\apps\backend\data\farmacia.sqlite apps\backend\data\farmacia.sqlite
  ```

- [x] **Corregir `apps/backend/src/app/app.module.ts`** — línea 47
  - **De**: `database: process.env.DB_PATH || join(__dirname, 'data', 'farmacia.sqlite'),`
  - **A**: `database: process.env.DB_PATH || join(__dirname, '..', '..', '..', 'apps', 'backend', 'data', 'farmacia.sqlite'),`
  - Nota: `__dirname` en webpack = `dist/apps/backend/`. Subimos 3 niveles al root del monorepo y bajamos a `apps/backend/data/`.

- [x] **Corregir `apps/backend/typeorm-data-source.ts`** — línea 18 (verificar)
  - **De**: `database: process.env.DB_PATH || join(__dirname, 'data', 'farmacia.sqlite'),`
  - Ya resuelve correctamente a `apps/backend/data/farmacia.sqlite` cuando se ejecuta con ts-node.
  - Opcional: agregar comentario para claridad.

- [x] **Ajustar `webpack.config.js`** — línea 8 (`clean.keep`)
  - Verificar que `keep: /\/data\//` conserva el directorio data/ en dist/ (ya está, no requiere cambio).

- [x] **Verificar que ambos apuntan al mismo archivo**
  ```bash
  # Tras el fix, revisar que la ruta resuelva correctamente
  node -e "const {join} = require('path'); console.log(join(__dirname, '..', '..', '..', 'apps', 'backend', 'data', 'farmacia.sqlite'));"
  # Debe mostrar: .../apps/backend/data/farmacia.sqlite
  ```

---

## Fase 2: Desactivar `synchronize` y preparar migraciones ✅

- [x] **Editar `apps/backend/src/app/app.module.ts`**
  - `synchronize: true` → `false`
  - `migrationsRun: false` → `true`
  - `migrations: [/* retirar las 4 clases históricas */]` → `migrations: [AddSuplidaToPacienteNecesidad1741708800000]`
  - Eliminar los 4 imports de migraciones históricas (CreateNucleoFamiliar, AddTitularFk, AddActivoAndRoles, CreateReceta)

- [x] **Verificar que la tabla `migrations` existe en la BD actual**
  ```sql
  -- Conectar a apps/backend/data/farmacia.sqlite y ejecutar:
  SELECT name FROM sqlite_master WHERE type='table' AND name='migrations';
  ```
  Si no existe (porque `synchronize: true` no crea la tabla de migraciones), la creará automáticamente TypeORM al ejecutar la primera migración.

---

## Fase 3: Actualizar entidad `PacienteNecesidad` ✅

- [x] **Editar `apps/backend/src/app/common/entities/paciente-necesidad.entity.ts`**

  Agregar las siguientes columnas y relaciones:

  | Propiedad | Decorador | Tipo | Detalle |
  |---|---|---|---|
  | `suplida` | `@Column({ default: false })` | `boolean` | Indica si la necesidad fue cumplida |
  | `fechaSuplida` | `@Column({ type: 'datetime', nullable: true })` | `Date \| undefined` | Cuándo se marcó como suplida |
  | `suplidaPor` | `@ManyToOne(() => Usuario, { nullable: true })` + `@JoinColumn({ name: 'suplida_por_id' })` | `Usuario \| undefined` | Quién marcó la necesidad |
  | `activo` | `@Column({ default: true })` | `boolean` | Soft-delete |
  | `createdAt` | `@CreateDateColumn()` | `Date` | Trazabilidad de creación |

  Verificar que el `@JoinColumn({ name: 'suplida_por_id' })` usa el nombre correcto para la columna.

- [x] **Actualizar importaciones** en el archivo de entidad — agregar `ManyToOne`, `JoinColumn`, `CreateDateColumn` si no están importados.

- [x] **Agregar relación inversa en `usuario.entity.ts`** (opcional, para consultas)

  ```typescript
  @OneToMany(() => PacienteNecesidad, (pn) => pn.suplidaPor)
  necesidadesSuplidas?: PacienteNecesidad[];
  ```

---

## Fase 4: Crear la migración SQL ✅

- [x] **Crear archivo**: `apps/backend/src/app/common/migrations/1741708800000-AddSuplidaToPacienteNecesidad.ts`

  ```typescript
  import { MigrationInterface, QueryRunner } from 'typeorm';

  export class AddSuplidaToPacienteNecesidad1741708800000 implements MigrationInterface {
    name = 'AddSuplidaToPacienteNecesidad1741708800000';

    async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "paciente_necesidad" ADD COLUMN "suplida" boolean NOT NULL DEFAULT (0)`);
      await queryRunner.query(`ALTER TABLE "paciente_necesidad" ADD COLUMN "fecha_suplida" datetime NULL`);
      await queryRunner.query(`ALTER TABLE "paciente_necesidad" ADD COLUMN "suplida_por_id" integer NULL`);
      await queryRunner.query(`ALTER TABLE "paciente_necesidad" ADD COLUMN "activo" boolean NOT NULL DEFAULT (1)`);
      await queryRunner.query(`ALTER TABLE "paciente_necesidad" ADD COLUMN "created_at" datetime NOT NULL DEFAULT (datetime('now'))`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
      // SQLite no soporta DROP COLUMN simple.
      // Para revertir habría que recrear la tabla sin estas columnas.
      // No implementamos down por seguridad de datos.
    }
  }
  ```

- [x] **Actualizar `app.module.ts`** — importar la nueva migración y agregarla al array `migrations: [...]`.

- [x] **Actualizar `typeorm-data-source.ts`** — ya usa glob `*.ts`, no requiere cambios.

---

## Fase 5: Ejecutar la migración ✅

- [x] **Backup inmediato antes de la migración**
  ```bash
  copy apps\backend\data\farmacia.sqlite apps\backend\data\farmacia.sqlite.backup-2026-07-09-premigracion
  ```

- [x] **Ejecutar migración**
  ```bash
  npm run migration:run
  ```
  O alternativamente:
  ```bash
  npx typeorm -d apps/backend/typeorm-data-source.ts migration:run
  ```

- [x] **Verificar migración**
  ```bash
  npm run migration:show
  ```
  Debe mostrar la migración como `✓ AlreadyRun` (o similar).

- [x] **Verificar columnas agregadas**
  ```bash
  # Usar sqlite3 o node para verificar
  node -e "
  const {join} = require('path');
  const db = require('node:sqlite');
  const {DatabaseSync} = db;
  const dbPath = join('apps', 'backend', 'data', 'farmacia.sqlite');
  const conn = new DatabaseSync(dbPath);
  const info = conn.prepare('PRAGMA table_info(paciente_necesidad)').all();
  console.log(info.map(r => r.name + ' (' + r.type + ')').join('\n'));
  conn.close();
  "
  ```
  Debe mostrar: id, paciente_id, necesidad_id, suplida, fecha_suplida, suplida_por_id, activo, created_at

- [x] **Verificar datos preservados**
  ```bash
  node -e "
  const {join} = require('path');
  const {DatabaseSync} = require('node:sqlite');
  const conn = new DatabaseSync(join('apps', 'backend', 'data', 'farmacia.sqlite'));
  const count = conn.prepare('SELECT COUNT(*) as total FROM paciente_necesidad').get();
  console.log('Registros preservados:', count.total);
  conn.close();
  "
  ```
  El conteo debe ser el mismo que antes de la migración.

- [x] **Iniciar backend y probar**
  ```bash
  npx nx serve backend
  ```
  Verificar que arranca sin errores y la API responde.

---

## Fase 6: Backend — Nuevo endpoint `PATCH .../suplida` ✅

- [x] **Agregar método en `PacientesService`**

  ```typescript
  async marcarNecesidadSuplida(pacienteId: number, necesidadId: number, usuarioId: number): Promise<PacienteNecesidad> {
    const repo = this.dataSource.getRepository(PacienteNecesidad);
    const necesidad = await repo.findOne({
      where: { id: necesidadId, pacienteId, activo: true, suplida: false },
    });
    if (!necesidad) {
      throw new NotFoundException('Necesidad no encontrada o ya suplida');
    }
    necesidad.suplida = true;
    necesidad.fechaSuplida = new Date();
    necesidad.suplidaPor = { id: usuarioId } as Usuario;
    return repo.save(necesidad);
  }
  ```

- [x] **Agregar endpoint en `PacientesController`**

  ```typescript
  @Patch(':id/necesidades/:necId/suplida')
  @Roles(Role.SURVEYOR, Role.ADMIN)
  async marcarNecesidadSuplida(
    @Param('id', ParseIntPipe) id: number,
    @Param('necId', ParseIntPipe) necId: number,
    @CurrentUser() user: UsuarioToken,
  ) {
    return this.pacientesService.marcarNecesidadSuplida(id, necId, user.userId);
  }
  ```

- [x] **Registrar en `PacientesModule`** — verificar que `TypeOrmModule.forFeature([PacienteNecesidad])` está incluido en el módulo (o usar `DataSource` directamente).

- [x] **Modificar `updatePaciente()`** en `PacientesService`
  - Al reemplazar `necesidadIds[]`, NO eliminar los registros con `suplida = true`.
  - Sólo eliminar los no suplidos que ya no estén en el array entrante.

---

## Fase 7: Frontend — Asignar patologías/necesidades en todo paciente ✅

### 7.1 Registro de paciente standalone ✅

- [x] **Editar `apps/frontend/src/app/pacientes/modals/registro-paciente.modal.ts`**
  - Importar `PacientesService` para obtener catálogos de patologías y necesidades.
  - Agregar sección de **Patologías** (toggle list + campo `tratamiento` por cada seleccionada).
  - Agregar sección de **Necesidades** (toggle list, sin tratamiento).
  - Incluir `patologias[]` y `necesidadIds[]` en el DTO de creación (`POST /api/v1/pacientes`).
  - Mismo patrón visual que `RegistrarPacienteCarpaModal`.

### 7.2 Edición de paciente ✅

- [x] **Editar `apps/frontend/src/app/pacientes/modals/editar-paciente.modal.ts`**
  - Precargar las patologías y necesidades actuales del paciente.
  - Agregar las mismas secciones (toggle list + tratamiento para patologías).
  - Incluir en el DTO de actualización (`PATCH /api/v1/pacientes/:id`).

---

## Fase 8: Frontend — Componente compartido `ListaNecesidadesPacienteComponent` ✅

- [x] **Crear componente**: `apps/frontend/src/app/shared/components/lista-necesidades-paciente/lista-necesidades-paciente.component.ts`

  **Propósito**: Mostrar las necesidades de un paciente como checklist, permitiendo marcar como suplida.

  **Inputs**:
  - `necesidades: PacienteNecesidad[]` — lista completa del paciente
  - `pacienteId: number` — ID del paciente
  - `puedeEditar: boolean` — true si el usuario tiene rol SURVEYOR o ADMIN

  **Outputs**:
  - `suplidaChange: EventEmitter<PacienteNecesidad>` — notifica cuando se marca una como suplida

  **Comportamiento**:
  - Necesidades activas (no suplidas): mostrar como items con checkbox
    - Checkbox habilitado solo si `puedeEditar = true`
    - Al marcar: modal de confirmación "¿Marcar como suplida? Esta acción no se puede deshacer"
    - Confirmar → `PATCH /api/v1/pacientes/:id/necesidades/:necId/suplida`
    - Actualizar la lista localmente
  - Necesidades suplidas: mostrar como items de solo lectura con:
    - Icono `checkmark-circle` color success
    - Nombre de la necesidad
    - Note: "Suplida el {fecha} por {usuario}"

  **Archivos**:
  - `lista-necesidades-paciente.component.ts`
  - `lista-necesidades-paciente.component.html`
  - `lista-necesidades-paciente.component.scss`

### Diseño visual (HTML)

```html
<ion-list>
  <!-- Necesidades activas -->
  <ion-item *ngFor="let n of necesidadesActivas">
    <ion-checkbox
      slot="start"
      [checked]="false"
      [disabled]="!puedeEditar"
      (ionChange)="confirmarSuplida(n)"
    ></ion-checkbox>
    <ion-label>
      <h2>{{ n.necesidad.nombre }}</h2>
    </ion-label>
  </ion-item>

  <!-- Separador si hay suplidas -->
  <ion-item-divider *ngIf="necesidadesSuplidas.length > 0" color="light">
    <ion-label>Suplidas</ion-label>
  </ion-item-divider>

  <!-- Necesidades suplidas (solo lectura) -->
  <ion-item *ngFor="let n of necesidadesSuplidas" class="necesidad-suplida">
    <ion-icon slot="start" name="checkmark-circle" color="success"></ion-icon>
    <ion-label>
      <h2>{{ n.necesidad.nombre }}</h2>
      <ion-note>Suplida {{ n.fechaSuplida | date:'short' }} por {{ n.suplidaPor?.nombre || '—' }}</ion-note>
    </ion-label>
  </ion-item>
</ion-list>

<!-- Empty state si no hay necesidades -->
<ion-item *ngIf="necesidades.length === 0">
  <ion-label class="ion-text-center ion-text-medium">
    <p>Sin necesidades registradas</p>
  </ion-label>
</ion-item>
```

---

## Fase 9: Frontend — Integrar checklist en páginas ✅

### 9.1 Detalle de paciente ✅

- [x] **Editar `apps/frontend/src/app/pacientes/pages/detalle-paciente.page.ts`**
  - Reemplazar la sección actual de necesidades (chips) con `app-lista-necesidades-paciente`
  - Pasar `necesidades`, `pacienteId`, `puedeEditar` según rol del usuario
  - Escuchar evento `suplidaChange` para refrescar

### 9.2 Detalle de carpa ✅

- [x] **Editar `apps/frontend/src/app/censo/pages/detalle-carpa.page.ts`**
  - Reemplazar la visualización de necesidades por miembro con `app-lista-necesidades-paciente`
  - Cada miembro tendría su propio componente de lista
  - Pasar `puedeEditar` según rol

### 9.3 Lista de pacientes ✅

- [x] **Editar `apps/frontend/src/app/pacientes/pages/lista-pacientes.page.ts`**
  - En la vista de detalle de cada paciente, mostrar chips indicadores de necesidades y patologías

---

## Fase 10: Frontend — Servicios ✅

- [x] **Agregar método en `PacientesService`** (abstracto):

  ```typescript
  abstract marcarNecesidadSuplida(pacienteId: number, necesidadId: number): Observable<PacienteNecesidad>;
  ```

- [x] **Implementar en `ApiPacientesService`**:

  ```typescript
  marcarNecesidadSuplida(pacienteId: number, necesidadId: number): Observable<PacienteNecesidad> {
    return this.http.patch<PacienteNecesidad>(
      `${this.baseUrl}/pacientes/${pacienteId}/necesidades/${necesidadId}/suplida`,
      {}
    );
  }
  ```

- [x] **Verificar modelo `PacienteNecesidad`** en frontend incluye los nuevos campos:
  - `suplida: boolean`
  - `fechaSuplida?: string`
  - `suplidaPor?: { id: number; nombre: string }`
  - `activo: boolean`
  - `createdAt: string`

---

## Fase 11: Verificación final

- [x] **Backend**: `npm run migration:show` — muestra migración como ejecutada
- [x] **Backend**: `npx nx serve backend` — arranca sin errores
- [x] **Frontend**: `npx nx build frontend --configuration=development` — compila sin errores
- [ ] **Backend**: `curl -X PATCH /api/v1/pacientes/1/necesidades/1/suplida` — responde 200 y el registro se marca como suplido
- [ ] **Backend**: `curl -X PATCH ...` repetido — responde 404 (ya suplida)
- [ ] **Frontend**: `npx nx serve frontend` — arranca sin errores
- [ ] **Frontend**: Modal de registro de paciente muestra patologías y necesidades
- [ ] **Frontend**: Modal de edición de paciente muestra patologías y necesidades precargadas
- [ ] **Frontend**: Detalle de paciente muestra checklist de necesidades con opción de marcar suplida
- [ ] **Frontend**: Detalle de carpa muestra checklist por miembro
- [ ] **Frontend**: Usuario sin rol SURVEYOR/ADMIN ve las necesidades pero no puede marcarlas
- [ ] **Frontend**: Al marcar como suplida, aparece modal de confirmación y la UI se actualiza

---

## Fase de Contingencia (rollback) — no ejecutada

> La migración y los cambios se completaron sin necesidad de rollback. Los backups están disponibles en `apps/backend/data/`.

Si algo sale mal en el futuro:

- [ ] **Detener backend**
- [ ] **Restaurar BD desde backup**:
  ```bash
  copy /Y apps\backend\data\farmacia.sqlite.backup-2026-07-09-premigracion apps\backend\data\farmacia.sqlite
  ```
- [ ] **Revertir cambios en `app.module.ts`**: volver a `synchronize: true`, `migrationsRun: false`
- [ ] **Revertir cambios en entidades**: quitar las nuevas columnas de `PacienteNecesidad`
- [ ] **Eliminar archivo de migración**: borrar `1741708800000-AddSuplidaToPacienteNecesidad.ts`
- [ ] **Reiniciar backend** y verificar que funciona con datos anteriores
