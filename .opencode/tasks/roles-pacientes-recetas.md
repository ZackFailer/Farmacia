# Plan: Roles + Pacientes + Recetas + Cola de Dispensación

> **Checklist de implementación**. Completar en orden secuencial.

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `recepcionista` | CRUD pacientes (soft delete), generate QR |
| `doctor` | Escanear paciente, ver datos/historial/stock, crear receta |
| `farmaceutico` | Ver cola de recetas, seleccionar paciente, dispensar |
| `recepcionista_med` | Crear medicamentos y lotes |
| `admin` | Acceso total + borrado físico |

> `despachador` se elimina. `farmaceutico` se mantiene.

---

## Fase 1 — Fundación: roles + soft delete

### 1.1 Expandir `UserRole` enum
- [x] Abrir `apps/backend/src/app/common/enums/role.enum.ts`
- [x] Agregar: `RECEPTIONIST = 'recepcionista'`
- [x] Agregar: `DOCTOR = 'doctor'`
- [x] Agregar: `MEDICATION_RECEPTIONIST = 'recepcionista_med'`
- [x] Agregar: `ADMIN = 'admin'`
- [x] Eliminar: `DISPENSER = 'despachador'`

### 1.2 Agregar columna `activo` a todas las entidades
- [x] `usuario.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `paciente.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `medicamento.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `lote.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `lote_movimiento.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `dispensacion.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `dispensacion-detalle.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [x] `configuracion.entity.ts` — `@Column({ default: true }) activo!: boolean`

### 1.3 Crear migración `AddActivoAndRoles`
- [x] Crear `apps/backend/src/app/common/migrations/1741190840000-AddActivoAndRoles.ts`
- [x] `up`: ALTER TABLE para agregar columna `activo` en todas las tablas (SQLite: recrear tablas o manejar default)
- [x] `down`: revertir
- [x] Registrar en `app.module.ts` y `typeorm-data-source.ts`

### 1.4 Actualizar seed
- [x] `auth.service.ts` (o seed.ts si existe): agregar usuario `admin` con rol `admin`
- [x] Actualizar seeds existentes con nuevo enum (eliminar `despachador`)

### 1.5 Actualizar queries existentes
- [x] En cada `find`/`findOne` de cada service, agregar `where: { activo: true }` (excepto admin)

### 1.6 Verificación Fase 1
- [x] `npx nx build backend`
- [x] `npx nx test backend`
- [x] `npx nx lint backend`

---

## Fase 2 — Módulo `Pacientes` ✅

### 2.1 Backend: Estructura del módulo ✅

#### 2.1.1 Mover DTO
- [x] Crear `apps/backend/src/app/pacientes/dto/crear-paciente.dto.ts`

#### 2.1.2 Crear `actualizar-paciente.dto.ts`
- [x] Crear `apps/backend/src/app/pacientes/dto/actualizar-paciente.dto.ts`

#### 2.1.3 Crear `agregar-familiar.dto.ts`
- [x] Crear `apps/backend/src/app/pacientes/dto/agregar-familiar.dto.ts`

#### 2.1.4 Crear `PacientesService`
- [x] Crear `apps/backend/src/app/pacientes/pacientes.service.ts`

#### 2.1.5 Crear `PacientesController`
- [x] Crear `apps/backend/src/app/pacientes/pacientes.controller.ts`

#### 2.1.6 Crear `PacientesModule`
- [x] Crear `apps/backend/src/app/pacientes/pacientes.module.ts`

#### 2.1.7 Registrar en `app.module.ts`
- [x] Importar `PacientesModule`

### 2.2 Backend: Simplificar `DispensacionService` ✅
- [x] Service simplificado (solo DataSource injection, métodos pacientes removidos)
- [x] Module limpiado (solo Lote, Configuracion, Dispensacion, etc.)
- [x] Controller limpiado (solo endpoints de dispensación)

### 2.3 Frontend: Estructura del módulo ✅
- [x] `PacientesService` (abstract + mock + api)
- [x] 4 modales (busqueda-paciente, registro-paciente, editar-paciente, agregar-familiar)
- [x] 2 páginas (lista-pacientes, detalle-paciente)
- [x] Rutas + app.routes.ts + app.config.ts
- [x] paso1-escanear-paciente actualizado

### 2.4 Verificación Fase 2
- [x] Build backend + frontend
- [x] Tests backend 6/6 + frontend 38/38

---

## Fase 3 — Módulo `Recetas` (doctor) ✅

### 3.1 Backend: Entidades ✅

#### 3.1.1 Crear `receta.entity.ts` ✅
- [x] `apps/backend/src/app/common/entities/receta.entity.ts`
- [x] Columnas: `id`, `pacienteId` FK, `doctorId` FK, `fechaHora`, `estado` (pendiente/despachada/cancelada), `activo`, `createdAt`
- [x] Relaciones: `@ManyToOne(() => Paciente)`, `@ManyToOne(() => Usuario)` (doctor)
- [x] `@OneToMany(() => RecetaDetalle)`

#### 3.1.2 Crear `receta-detalle.entity.ts` ✅
- [x] `apps/backend/src/app/common/entities/receta-detalle.entity.ts`
- [x] Columnas: `id`, `recetaId` FK, `medicamentoId` FK, `cantidadRecetada`, `dias`, `dosisIndicada`, `activo`, `createdAt`
- [x] Relaciones: `@ManyToOne(() => Receta)`, `@ManyToOne(() => Medicamento)`

#### 3.1.3 Registrar en módulos ✅
- [x] Agregar ambas entidades a `entities` en `app.module.ts`

### 3.2 Backend: Estructura del módulo ✅

#### 3.2.1 Crear DTOs ✅
- [x] `apps/backend/src/app/recetas/dto/crear-receta.dto.ts`
  - `pacienteId: number`, `detalles: { medicamentoId: number, cantidadRecetada: number, dias: number, dosisIndicada?: string }[]`
- [x] `apps/backend/src/app/recetas/dto/actualizar-estado-receta.dto.ts`
  - `estado: 'pendiente' | 'despachada' | 'cancelada'`

#### 3.2.2 Crear `RecetasService` ✅
- [x] `apps/backend/src/app/recetas/recetas.service.ts`
- [x] Métodos:
  - [x] `createReceta(dto, doctorId)` — crear receta + detalles, estado = pendiente
  - [x] `getReceta(id)` — con relaciones (paciente, detalles.medicamento)
  - [x] `getRecetasPendientes()` — cola para farmacéutico (activo + pendiente)
  - [x] `getRecetasByPaciente(pacienteId)` — historial de recetas del paciente
  - [x] `updateEstado(id, estado)` — cambiar estado

#### 3.2.3 Crear `RecetasController` ✅
- [x] `apps/backend/src/app/recetas/recetas.controller.ts`
- [x] Permisos:
  - [x] `POST /api/v1/recetas` → `@Roles(DOCTOR, ADMIN)`
  - [x] `GET /api/v1/recetas/pendientes` → `@Roles(FARMACEUTICO, ADMIN)`
  - [x] `GET /api/v1/recetas/:id` → `@Roles(DOCTOR, FARMACEUTICO, ADMIN)`
  - [x] `GET /api/v1/recetas/paciente/:pacienteId` → `@Roles(DOCTOR, FARMACEUTICO, ADMIN)`
  - [x] `PATCH /api/v1/recetas/:id/estado` → `@Roles(FARMACEUTICO, ADMIN)`

#### 3.2.4 Crear `RecetasModule` ✅
- [x] `apps/backend/src/app/recetas/recetas.module.ts`
- [x] TypeOrm.forFeature: `Receta`, `RecetaDetalle`, `Paciente`, `Medicamento`
- [x] Registrar en `app.module.ts`

#### 3.2.5 Migración `CreateReceta` ✅
- [x] Crear migración con tablas `receta` y `receta_detalle`

### 3.3 Frontend: Estructura del módulo ✅

#### 3.3.1 Servicios ✅
- [x] `apps/frontend/src/app/recetas/services/recetas.service.ts` — abstracto
- [x] `apps/frontend/src/app/recetas/services/recetas.service.mock.ts` — seed
- [x] `apps/frontend/src/app/recetas/services/recetas.service.api.ts` — HTTP

#### 3.3.2 Modelos ✅
- [x] `apps/frontend/src/app/shared/models/receta.model.ts`
  - `Receta { id, pacienteId, doctorId, fechaHora, estado, detalles[], activo, created_at }`
  - `RecetaDetalle { id, recetaId, medicamentoId, cantidadRecetada, dias, dosisIndicada }`

#### 3.3.3 Páginas (doctor) ✅
- [x] `apps/frontend/src/app/recetas/pages/recetar.page.ts`
  - Paso 1: buscar/escanear paciente (reusar `PacientesService`)
  - Paso 2: seleccionar medicamentos de DB + indicar días
  - Paso 3: confirmar receta

#### 3.3.4 Rutas ✅
- [x] `apps/frontend/src/app/recetas/recetas.routes.ts`
- [x] Agregar `/recetas` lazy en `app.routes.ts`

### 3.4 Verificación Fase 3 ✅
- [x] `npx nx build backend`
- [x] `npx nx test backend`
- [x] `npx nx lint backend`
- [x] `npx nx build frontend`
- [x] `npx nx test frontend`
- [ ] `npx nx lint frontend` — errores preexistentes (no introducidos por Fase 3)

---

## Fase 4 — Cola de dispensación (farmacéutico)

### 4.1 Backend: Vincular receta con dispensación

#### 4.1.1 Modificar `dispensacion.entity.ts`
- [ ] Agregar columna `recetaId` FK → `receta` (nullable)
- [ ] `@ManyToOne(() => Receta)`
- [ ] `@JoinColumn({ name: 'receta_id' })`

#### 4.1.2 Modificar `CrearDispensacionDto`
- [ ] Agregar campo opcional `receta_id?: number`

#### 4.1.3 Modificar `DispensacionService.crearDispensacion()`
- [ ] Si `recetaId` está presente, actualizar estado de receta a `despachada`
- [ ] Vincular dispensación con receta

#### 4.1.4 Agregar endpoint en `DispensacionController`
- [ ] `GET /api/v1/dispensaciones/pendientes` → `@Roles(FARMACEUTICO, ADMIN)`
- [ ] Retorna recetas con estado `pendiente`, con datos del paciente y detalles

### 4.2 Frontend: Cola de recetas pendientes

#### 4.2.1 Crear `paso0-cola.page.ts`
- [ ] `apps/frontend/src/app/dispensacion/pages/paso0-cola.page.ts`
- [ ] Lista de recetas pendientes (paciente, doctor, medicamentos recetados)
- [ ] Al seleccionar una receta → navegar a paso1 con el paciente precargado
- [ ] Mostrar medicamentos recetados en paso2 como pre-seleccionados

#### 4.2.2 Modificar `dispensacion.routes.ts`
- [ ] Agregar ruta `cola` como paso 0
- [ ] La ruta raíz de dispensación redirige a `cola`

#### 4.2.3 Modificar `paso2-seleccionar-meds.page.ts`
- [ ] Si viene de una receta, mostrar medicamentos pre-seleccionados (solo ajustar cantidades)

#### 4.2.4 Modificar `paso3-confirmar.page.ts`
- [ ] Al confirmar, enviar `receta_id` en el DTO

### 4.3 Verificación Fase 4
- [ ] `npx nx build backend`
- [ ] `npx nx test backend`
- [ ] `npx nx lint backend`
- [ ] `npx nx build frontend`
- [ ] `npx nx test frontend`
- [ ] `npx nx lint frontend`

---

## Fase 5 — Autorización general

### 5.1 Backend: Agregar `@Roles()` en todos los controllers

#### 5.1.1 `AuthController`
- [ ] `POST /api/v1/auth/login` → público (sin guard)
- [ ] `GET /api/v1/auth/me` → autenticado (sin role específico)

#### 5.1.2 `PacientesController`
- [ ] Ya definido en Fase 2

#### 5.1.3 `RecetasController`
- [ ] Ya definido en Fase 3

#### 5.1.4 `DispensacionController`
- [ ] `@Roles(UserRole.PHARMACEUTICAL, UserRole.ADMIN)` nivel clase
- [ ] Endpoints de pacientes removidos (ya están en PacientesController)

#### 5.1.5 `RecepcionController`
- [ ] `@Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.ADMIN)` nivel clase

#### 5.1.6 `InventarioController`
- [ ] `@Roles(UserRole.MEDICATION_RECEPTIONIST, UserRole.PHARMACEUTICAL, UserRole.ADMIN)` nivel clase

#### 5.1.7 `HistorialController`
- [ ] `@Roles(UserRole.DOCTOR, UserRole.PHARMACEUTICAL, UserRole.ADMIN)` nivel clase

#### 5.1.8 `AdministracionController`
- [ ] Cambiar `@Roles(UserRole.PHARMACEUTICAL)` → `@Roles(UserRole.ADMIN)` nivel clase

### 5.2 Frontend: Guards de rol

#### 5.2.1 Crear `role.guard.ts`
- [ ] `apps/frontend/src/app/core/guards/role.guard.ts`
- [ ] Recibe lista de roles permitidos
- [ ] Lee rol del token JWT almacenado
- [ ] Si no tiene permiso, redirige a página principal

#### 5.2.2 Aplicar guards en rutas
- [ ] `/pacientes` → `recepcionista`, `admin`
- [ ] `/recetas` → `doctor`, `admin`
- [ ] `/dispensacion` → `farmaceutico`, `admin`
- [ ] `/inventario` → `recepcionista_med`, `farmaceutico`, `admin`
- [ ] `/historial` → `doctor`, `farmaceutico`, `admin`
- [ ] `/admin` → `admin`

#### 5.2.3 Ocultar elementos de navegación por rol
- [ ] Sidebar/menú: mostrar solo las opciones permitidas según el rol del usuario

### 5.3 Verificación Fase 5
- [ ] `npx nx build backend`
- [ ] `npx nx test backend`
- [ ] `npx nx lint backend`
- [ ] `npx nx build frontend`
- [ ] `npx nx test frontend`
- [ ] `npx nx lint frontend`

---

## Resumen de archivos

### Crear (39)

| Módulo | Archivos |
|---|---|
| **Pacientes** (backend) | `pacientes.module.ts`, `pacientes.controller.ts`, `pacientes.service.ts`, `dto/actualizar-paciente.dto.ts`, `dto/agregar-familiar.dto.ts` |
| **Pacientes** (frontend) | `services/pacientes.service.ts`, `.mock.ts`, `.api.ts`, `pages/lista-pacientes.page.ts`, `pages/detalle-paciente.page.ts`, `modals/editar-paciente.modal.ts`, `modals/agregar-familiar.modal.ts`, `pacientes.routes.ts` |
| **Recetas** (backend) ✅ | `entities/receta.entity.ts`, `entities/receta-detalle.entity.ts`, `recetas.module.ts`, `recetas.controller.ts`, `recetas.service.ts`, `dto/crear-receta.dto.ts`, `dto/actualizar-estado-receta.dto.ts` |
| **Recetas** (frontend) ✅ | `services/recetas.service.ts`, `.mock.ts`, `.api.ts`, `models/receta.model.ts`, `pages/recetar.page.ts`, `recetas.routes.ts` |
| **Dispensación** (frontend) | `pages/paso0-cola.page.ts` |
| **Core** (frontend) | `guards/role.guard.ts` |
| **Migraciones** | `AddActivoAndRoles.ts`, `CreateReceta.ts` |

### Mover (2)

| Desde | Hacia |
|---|---|
| `dispensacion/modals/busqueda-paciente.modal.ts` | `pacientes/modals/` |
| `dispensacion/modals/registro-paciente.modal.ts` | `pacientes/modals/` |
| `dispensacion/dto/crear-paciente.dto.ts` | `pacientes/dto/` |

### Modificar (23)

| Archivo | Cambio |
|---|---|
| `role.enum.ts` | Agregar 4 roles, eliminar `DISPENSER` |
| `usuario.entity.ts` | + `activo` |
| `paciente.entity.ts` | + `activo` |
| `medicamento.entity.ts` | + `activo` |
| `lote.entity.ts` | + `activo` |
| `lote_movimiento.entity.ts` | + `activo` |
| `dispensacion.entity.ts` | + `activo`, + `recetaId` FK |
| `dispensacion-detalle.entity.ts` | + `activo` |
| `configuracion.entity.ts` | + `activo` |
| `app.module.ts` ✅ | + PacientesModule, + RecetasModule, + Receta, RecetaDetalle entities |
| `dispensacion.module.ts` | Remover Paciente, PacienteFamiliar de forFeature |
| `dispensacion.service.ts` | Remover métodos de pacientes, + recetaId en crearDispensacion |
| `dispensacion.controller.ts` | + GET pendientes, remover endpoints de pacientes |
| `dispensacion.routes.ts` | + ruta `cola` |
| `paso1-escanear-paciente.page.ts` | Inyectar PacientesService |
| `paso2-seleccionar-meds.page.ts` | Pre-seleccionar desde receta |
| `paso3-confirmar.page.ts` | Enviar receta_id |
| `app.routes.ts` ✅ | + `/pacientes`, + `/recetas` |
| `app.config.ts` ✅ | + PacientesService, RecetasService providers |
| `administracion.controller.ts` | Rol `ADMIN` en vez de `PHARMACEUTICAL` |
| `typeorm-data-source.ts` | + migraciones nuevas |
| `auth.service.ts` | Seed con admin |
| 8 controllers (roles) | Agregar `@Roles()` decorators |

---

## Notas importantes

- **Doctor receta**: solo selecciona medicamento existente en DB + cantidad de días. La dosis y presentación vienen del medicamento.
- **Borrado lógico**: todas las tablas tienen `activo`. Admin tiene acceso a `@Delete()` físico (opcional, implementar después).
- **Cola de dispensación**: el farmacéutico ve las recetas pendientes, selecciona una, y los medicamentos aparecen pre-cargados en paso2.
- **Receta → Dispensación**: al crear dispensación con `receta_id`, la receta se marca como `despachada`.
