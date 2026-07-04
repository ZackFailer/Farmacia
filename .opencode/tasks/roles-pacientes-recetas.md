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
- [ ] Abrir `apps/backend/src/app/common/enums/role.enum.ts`
- [ ] Agregar: `RECEPTIONIST = 'recepcionista'`
- [ ] Agregar: `DOCTOR = 'doctor'`
- [ ] Agregar: `MEDICATION_RECEPTIONIST = 'recepcionista_med'`
- [ ] Agregar: `ADMIN = 'admin'`
- [ ] Eliminar: `DISPENSER = 'despachador'`

### 1.2 Agregar columna `activo` a todas las entidades
- [ ] `usuario.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `paciente.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `medicamento.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `lote.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `lote_movimiento.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `dispensacion.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `dispensacion-detalle.entity.ts` — `@Column({ default: true }) activo!: boolean`
- [ ] `configuracion.entity.ts` — `@Column({ default: true }) activo!: boolean`

### 1.3 Crear migración `AddActivoAndRoles`
- [ ] Crear `apps/backend/src/app/common/migrations/1741190840000-AddActivoAndRoles.ts`
- [ ] `up`: ALTER TABLE para agregar columna `activo` en todas las tablas (SQLite: recrear tablas o manejar default)
- [ ] `down`: revertir
- [ ] Registrar en `app.module.ts` y `typeorm-data-source.ts`

### 1.4 Actualizar seed
- [ ] `auth.service.ts` (o seed.ts si existe): agregar usuario `admin` con rol `admin`
- [ ] Actualizar seeds existentes con nuevo enum (eliminar `despachador`)

### 1.5 Actualizar queries existentes
- [ ] En cada `find`/`findOne` de cada service, agregar `where: { activo: true }` (excepto admin)
- [ ] Opcional: crear `BaseService` con filtro automático de `activo`

### 1.6 Verificación Fase 1
- [ ] `npx nx build backend`
- [ ] `npx nx test backend`
- [ ] `npx nx lint backend`

---

## Fase 2 — Módulo `Pacientes`

### 2.1 Backend: Estructura del módulo

#### 2.1.1 Mover DTO
- [ ] Copiar `apps/backend/src/app/dispensacion/dto/crear-paciente.dto.ts` → `apps/backend/src/app/pacientes/dto/crear-paciente.dto.ts`
- [ ] Quitar original de `dispensacion/dto/`

#### 2.1.2 Crear `actualizar-paciente.dto.ts`
- [ ] Crear `apps/backend/src/app/pacientes/dto/actualizar-paciente.dto.ts`
- [ ] Campos: `nombre?`, `apellido?`, `cedula?`, `sexo?`, `edadEstimada?`, `pesoEstimado?`, `esDamnificado?`

#### 2.1.3 Crear `agregar-familiar.dto.ts`
- [ ] Crear `apps/backend/src/app/pacientes/dto/agregar-familiar.dto.ts`
- [ ] Campos: `pacienteId: number`, `relacion: string`

#### 2.1.4 Crear `PacientesService`
- [ ] Crear `apps/backend/src/app/pacientes/pacientes.service.ts`
- [ ] Inyectar repositorios: `Paciente`, `NucleoFamiliar`, `NucleoFamiliarMiembro`
- [ ] Métodos (extraídos de `DispensacionService`):
  - [ ] `createPaciente(dto)` — crear + núcleo familiar
  - [ ] `getPacienteByIdEmergencia(idEmergencia)`
  - [ ] `getPacienteById(id)`
  - [ ] `searchPacientes(query)` — filtrar por `activo: true`
  - [ ] `updatePaciente(id, dto)`
  - [ ] `softDeletePaciente(id)` — set `activo = false`
  - [ ] `getNucleo(pacienteId)` — miembros del núcleo
  - [ ] `agregarFamiliar(pacienteId, dto)` — agregar paciente existente al núcleo
  - [ ] `quitarFamiliar(pacienteId, miembroId)` — quitar del núcleo

#### 2.1.5 Crear `PacientesController`
- [ ] Crear `apps/backend/src/app/pacientes/pacientes.controller.ts`
- [ ] `@Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)` a nivel de clase
- [ ] Endpoints:
  - [ ] `POST /api/v1/pacientes` — crear
  - [ ] `GET /api/v1/pacientes?q=` — buscar (público entre roles con permiso)
  - [ ] `GET /api/v1/pacientes/:id` — obtener por ID
  - [ ] `GET /api/v1/pacientes/emergencia/:idEmergencia` — obtener por EM-XXXX
  - [ ] `PATCH /api/v1/pacientes/:id` — editar
  - [ ] `DELETE /api/v1/pacientes/:id` — soft delete
  - [ ] `POST /api/v1/pacientes/:id/nucleo` — agregar familiar
  - [ ] `DELETE /api/v1/pacientes/:id/nucleo/:miembroId` — quitar familiar
  - [ ] `GET /api/v1/pacientes/:id/nucleo` — núcleo completo

#### 2.1.6 Crear `PacientesModule`
- [ ] Crear `apps/backend/src/app/pacientes/pacientes.module.ts`
- [ ] TypeOrm.forFeature: `Paciente`, `NucleoFamiliar`, `NucleoFamiliarMiembro`

#### 2.1.7 Registrar en `app.module.ts`
- [ ] Importar `PacientesModule`

### 2.2 Backend: Simplificar `DispensacionService`
- [ ] Remover `@InjectRepository(Paciente)` (si ya no se necesita para dispensación)
  - Nota: `crearDispensacion` usa `manager.findOne(Paciente, ...)` dentro de transacción, no necesita repositorio
- [ ] Remover métodos: `generateNextEmergenciaId`, `loadPacienteConNucleo`, `createPaciente`, `getPacienteByIdEmergencia`, `getFamiliares`, `searchPacientes`
- [ ] Verificar que `crearDispensacion` sigue funcionando (usa `dataSource.manager.findOne(Paciente)`)
- [ ] Remover imports de `Paciente`, `NucleoFamiliar`, `NucleoFamiliarMiembro`, `CrearPacienteDto`
- [ ] Remover `PacienteFamiliar` y `Paciente` de `dispensacion.module.ts` si ya no se inyectan

### 2.3 Frontend: Estructura del módulo

#### 2.3.1 Crear servicios
- [ ] `apps/frontend/src/app/pacientes/services/pacientes.service.ts` — abstracto
- [ ] `apps/frontend/src/app/pacientes/services/pacientes.service.mock.ts` — seed + lógica
- [ ] `apps/frontend/src/app/pacientes/services/pacientes.service.api.ts` — HTTP mappings

#### 2.3.2 Mover modales existentes
- [ ] Mover `dispensacion/modals/busqueda-paciente.modal.ts` → `pacientes/modals/`
- [ ] Mover `dispensacion/modals/registro-paciente.modal.ts` → `pacientes/modals/`
- [ ] Actualizar imports en los modales movidos
- [ ] Actualizar todas las referencias a estos modales en `dispensacion/`

#### 2.3.3 Crear páginas
- [ ] `apps/frontend/src/app/pacientes/pages/lista-pacientes.page.ts` — búsqueda + FAB + cards
- [ ] `apps/frontend/src/app/pacientes/pages/detalle-paciente.page.ts` — datos + núcleo + historial

#### 2.3.4 Crear modales nuevos
- [ ] `apps/frontend/src/app/pacientes/modals/editar-paciente.modal.ts` — formulario precargado
- [ ] `apps/frontend/src/app/pacientes/modals/agregar-familiar.modal.ts` — buscar paciente + parentesco

#### 2.3.5 Crear rutas
- [ ] `apps/frontend/src/app/pacientes/pacientes.routes.ts`
- [ ] Agregar `/pacientes` lazy en `app.routes.ts`

#### 2.3.6 Actualizar `paso1-escanear-paciente.page.ts`
- [ ] Inyectar `PacientesService` en vez de `DispensacionService`
- [ ] Usar `PacientesService.buscarPaciente()` y `PacientesService.registrarPaciente()`

#### 2.3.7 Servicio global
- [ ] Agregar `PacientesService` al provider en `app.config.ts` (junto a `DispensacionService`)

### 2.4 Verificación Fase 2
- [ ] `npx nx build backend`
- [ ] `npx nx test backend`
- [ ] `npx nx lint backend`
- [ ] `npx nx build frontend`
- [ ] `npx nx test frontend`
- [ ] `npx nx lint frontend` (solo pre-existentes)

---

## Fase 3 — Módulo `Recetas` (doctor)

### 3.1 Backend: Entidades

#### 3.1.1 Crear `receta.entity.ts`
- [ ] `apps/backend/src/app/common/entities/receta.entity.ts`
- [ ] Columnas: `id`, `pacienteId` FK, `doctorId` FK, `fechaHora`, `estado` (pendiente/despachada/cancelada), `activo`, `createdAt`
- [ ] Relaciones: `@ManyToOne(() => Paciente)`, `@ManyToOne(() => Usuario)` (doctor)
- [ ] `@OneToMany(() => RecetaDetalle)`

#### 3.1.2 Crear `receta-detalle.entity.ts`
- [ ] `apps/backend/src/app/common/entities/receta-detalle.entity.ts`
- [ ] Columnas: `id`, `recetaId` FK, `medicamentoId` FK, `cantidadRecetada`, `dias`, `dosisIndicada`, `activo`, `createdAt`
- [ ] Relaciones: `@ManyToOne(() => Receta)`, `@ManyToOne(() => Medicamento)`

#### 3.1.3 Registrar en módulos
- [ ] Agregar ambas entidades a `entities` en `app.module.ts`

### 3.2 Backend: Estructura del módulo

#### 3.2.1 Crear DTOs
- [ ] `apps/backend/src/app/recetas/dto/crear-receta.dto.ts`
  - `pacienteId: number`, `detalles: { medicamentoId: number, cantidadRecetada: number, dias: number, dosisIndicada?: string }[]`
- [ ] `apps/backend/src/app/recetas/dto/actualizar-estado-receta.dto.ts`
  - `estado: 'pendiente' | 'despachada' | 'cancelada'`

#### 3.2.2 Crear `RecetasService`
- [ ] `apps/backend/src/app/recetas/recetas.service.ts`
- [ ] Métodos:
  - [ ] `createReceta(dto, doctorId)` — crear receta + detalles, estado = pendiente
  - [ ] `getReceta(id)` — con relaciones (paciente, detalles.medicamento)
  - [ ] `getRecetasPendientes()` — cola para farmacéutico (activo + pendiente)
  - [ ] `getRecetasByPaciente(pacienteId)` — historial de recetas del paciente
  - [ ] `updateEstado(id, estado)` — cambiar estado

#### 3.2.3 Crear `RecetasController`
- [ ] `apps/backend/src/app/recetas/recetas.controller.ts`
- [ ] Permisos:
  - [ ] `POST /api/v1/recetas` → `@Roles(DOCTOR, ADMIN)`
  - [ ] `GET /api/v1/recetas/pendientes` → `@Roles(FARMACEUTICO, ADMIN)`
  - [ ] `GET /api/v1/recetas/:id` → `@Roles(DOCTOR, FARMACEUTICO, ADMIN)`
  - [ ] `GET /api/v1/recetas/paciente/:pacienteId` → `@Roles(DOCTOR, FARMACEUTICO, ADMIN)`
  - [ ] `PATCH /api/v1/recetas/:id/estado` → `@Roles(FARMACEUTICO, ADMIN)`

#### 3.2.4 Crear `RecetasModule`
- [ ] `apps/backend/src/app/recetas/recetas.module.ts`
- [ ] TypeOrm.forFeature: `Receta`, `RecetaDetalle`, `Paciente`, `Medicamento`
- [ ] Registrar en `app.module.ts`

#### 3.2.5 Migración `CreateReceta`
- [ ] Crear migración con tablas `receta` y `receta_detalle`

### 3.3 Frontend: Estructura del módulo

#### 3.3.1 Servicios
- [ ] `apps/frontend/src/app/recetas/services/recetas.service.ts` — abstracto
- [ ] `apps/frontend/src/app/recetas/services/recetas.service.mock.ts` — seed
- [ ] `apps/frontend/src/app/recetas/services/recetas.service.api.ts` — HTTP

#### 3.3.2 Modelos
- [ ] `apps/frontend/src/app/shared/models/receta.model.ts`
  - `Receta { id, pacienteId, doctorId, fechaHora, estado, detalles[], activo, created_at }`
  - `RecetaDetalle { id, recetaId, medicamentoId, cantidadRecetada, dias, dosisIndicada }`

#### 3.3.3 Páginas (doctor)
- [ ] `apps/frontend/src/app/recetas/pages/recetar.page.ts`
  - Paso 1: buscar/escanear paciente (reusar `PacientesService`)
  - Paso 2: seleccionar medicamentos de DB + indicar días
  - Paso 3: confirmar receta

#### 3.3.4 Rutas
- [ ] `apps/frontend/src/app/recetas/recetas.routes.ts`
- [ ] Agregar `/recetas` lazy en `app.routes.ts`

### 3.4 Verificación Fase 3
- [ ] `npx nx build backend`
- [ ] `npx nx test backend`
- [ ] `npx nx lint backend`
- [ ] `npx nx build frontend`
- [ ] `npx nx test frontend`
- [ ] `npx nx lint frontend`

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
| **Recetas** (backend) | `entities/receta.entity.ts`, `entities/receta-detalle.entity.ts`, `recetas.module.ts`, `recetas.controller.ts`, `recetas.service.ts`, `dto/crear-receta.dto.ts`, `dto/actualizar-estado-receta.dto.ts` |
| **Recetas** (frontend) | `services/recetas.service.ts`, `.mock.ts`, `.api.ts`, `models/receta.model.ts`, `pages/recetar.page.ts`, `recetas.routes.ts` |
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
| `app.module.ts` | + PacientesModule, + RecetasModule, + Receta, RecetaDetalle entities |
| `dispensacion.module.ts` | Remover Paciente, PacienteFamiliar de forFeature |
| `dispensacion.service.ts` | Remover métodos de pacientes, + recetaId en crearDispensacion |
| `dispensacion.controller.ts` | + GET pendientes, remover endpoints de pacientes |
| `dispensacion.routes.ts` | + ruta `cola` |
| `paso1-escanear-paciente.page.ts` | Inyectar PacientesService |
| `paso2-seleccionar-meds.page.ts` | Pre-seleccionar desde receta |
| `paso3-confirmar.page.ts` | Enviar receta_id |
| `app.routes.ts` | + `/pacientes`, + `/recetas` |
| `app.config.ts` | + PacientesService, RecetasService providers |
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
