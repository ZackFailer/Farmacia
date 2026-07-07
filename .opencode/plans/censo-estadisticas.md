# Módulo Censo y Estadísticas — Plan de Implementación

> Documento generado a partir de requerimientos levantados el 06-Jul-2026.
> Refleja decisiones tomadas con el usuario y sirve como checklist para la implementación.

---

## 1. Requerimientos

### 1.1 Bugs detectados en producción

| ID | Bug | Prioridad |
|---|---|---|
| B1 | Al registrar familiar en `RegistroPacienteModal`, el `ion-select` de Sexo y ¿Es damnificado? no cambian visualmente al seleccionar una opción. | Alta |
| B2 | En el resumen de receta (`recetar.page.ts`) aparece "unds" (abreviatura de unidades) que el usuario interpreta como "año". Debe decir "Cantidad". | Alta |

### 1.2 Nuevo sistema de registro por carpa (Censo)

- El recepcionista/encuestador recorre las carpas del asentamiento para censar familias.
- Una **carpa** representa una **familia** (un `NucleoFamiliar`).
- Una familia tiene un **titular** (paciente responsable) y puede tener varios **miembros**.
- Cada carpa tiene un **código QR único** que se pega físicamente en la carpa.
- El QR permite identificar la familia completa al escanearlo.

### 1.3 Nuevo rol: `encuestador`

- Puede crear carpas y registrar pacientes en ellas.
- NO accede a medicamentos, recetas, inventario ni dispensación.
- Puede ver el tablero estadístico.

### 1.4 Nuevos catálogos

| Catálogo | Propósito |
|---|---|
| **Patologías** | Lista de enfermedades/condiciones para asociar a pacientes (ej: Hipertensión, Diabetes, Asma) |
| **Necesidades** | Lista de necesidades para asociar a pacientes (ej: Carpas, Camas, Medicamentos, Silla de ruedas, Lentes, Muletas, Bastón, Prótesis, Ropa, Alimentos) |

### 1.5 Nuevos campos en Paciente

- `tiene_discapacidad_motora: boolean` — default false
- `patologia_ids: number[]` — relación muchos-a-muchos con `CatalogoPatologia`
- `necesidad_ids: number[]` — relación muchos-a-muchos con `CatalogoNecesidad`
- `edad_meses: number` (0-11, opcional) — para precisión en menores de 2 años
- `edad_dias: number` (0-30, opcional) — para clasificar recién nacidos (0-28 días)

### 1.6 Clasificación etaria (calculada, no almacenada)

| Grupo | Rango | Lógica |
|---|---|---|
| Recién nacido | 0 a 28 días | edad_estimada = 0 AND edad_meses = 0 AND edad_dias BETWEEN 0 AND 28 |
| Preescolar | < 5 años | edad_estimada < 5 |
| Escolar | 6 a 10 años | edad_estimada BETWEEN 6 AND 10 |
| Adolescente | 11 a 15 años | edad_estimada BETWEEN 11 AND 15 |
| Adulto | 16 a 59 años | edad_estimada BETWEEN 16 AND 59 |
| Adulto mayor | 60+ años | edad_estimada >= 60 |

### 1.7 Tratamiento por patología

La relación Paciente ↔ Patología debe incluir un campo `tratamiento` (texto opcional) que describa qué tratamiento recibe el paciente para esa patología.

### 1.8 Tablero estadístico

Página con tabla de métricas (sin gráficos):

| Métrica | Fuente |
|---|---|
| Total pacientes | COUNT de Paciente WHERE activo=true |
| Masculinos / Femeninos | GROUP BY sexo |
| Recién nacidos (0-28d) | edad_estimada=0 AND edad_meses=0 AND edad_dias BETWEEN 0 AND 28 |
| Preescolares (< 5a) | edad_estimada < 5 |
| Escolares (6-10a) | edad_estimada BETWEEN 6 AND 10 |
| Adolescentes (11-15a) | edad_estimada BETWEEN 11 AND 15 |
| Adultos (16-59a) | edad_estimada BETWEEN 16 AND 59 |
| Adultos mayores (60+) | edad_estimada >= 60 |
| Con discapacidad motora | tiene_discapacidad_motora = true |
| Por patología | COUNT por CatalogoPatologia |
| Por necesidad | COUNT por CatalogoNecesidad |
| Total carpas/familias | COUNT de NucleoFamiliar WHERE activo=true |
| Pacientes por ubicación | GROUP BY NucleoFamiliar.ubicacion |

### 1.7 Offline-first

- Los datos censales deben poder registrarse sin conexión.
- Al volver online, se sincronizan automáticamente.
- Enfoque MVP: `localStorage` como cola de operaciones + `SyncService`.

### 1.8 Lotes (aplazado)

- Se acordó aplazar la simplificación del sistema de lotes.
- Decisión tomada: stock total por medicamento (sin vencimiento, donante ni trazabilidad).

---

## 2. Decisiones de Diseño

| Decisión | Opción elegida |
|---|---|
| Tabla Carpa | NO crear. Extender `NucleoFamiliar` con `codigo_carpa` y `ubicacion`. |
| QR de identificación | Por carpa (codigo_carpa), no por familia. |
| Visualización tablero | Solo tablas y números (sin gráficos). |
| Offline | localStorage + SyncService (sin IndexedDB en MVP). |
| Nuevo rol | `encuestador` — separado de `recepcionista`. |
| Lotes | Aplazado. Se decidió: solo stock total en Medicamento. |

---

## 3. Plan de Implementación (Checklist)

### Fase 1 — Bugfixes

- [x] **B1** Arreglar `ion-select` para Sexo y esDamnificado en familiares (`registro-paciente.modal.ts`):
  - Reemplazar `[(ngModel)]` con `(ionChange)` + asignación manual
  - Verificar que el `action-sheet` selecciona correctamente
- [x] **B2** Corregir etiqueta en resumen de receta (`recetar.page.ts`):
  - Cambiar `unds` → `Cantidad:`
  - Agregar campo `dias` a `RecetaItem` (`dispensacion.service.ts`)
  - Propagar `dias` en `setReceta()`

### Fase 2 — Backend: Catálogos

- [x] Crear entidad `CatalogoPatologia` (id, nombre, descripcion?, activo, created_at)
- [x] Crear entidad `CatalogoNecesidad` (id, nombre, descripcion?, activo, created_at)
- [x] Crear `PatologiaModule` + controller + service + DTOs
- [x] Crear `NecesidadModule` + controller + service + DTOs
- [x] Endpoints patologías: `GET /api/v1/patologias`, `POST /...`, `PATCH /...`, `DELETE /...` (admin)
- [x] Endpoints necesidades: `GET /api/v1/necesidades`, `POST /...`, `PATCH /...`, `DELETE /...` (admin)

### Fase 3 — Backend: Entidades existentes

- [x] Agregar `codigo_carpa` (varchar 20, UNIQUE) y `ubicacion` (varchar 200) a `NucleoFamiliar`
- [x] Agregar a `Paciente`: `tiene_discapacidad_motora` (boolean), `edad_meses` (int nullable), `edad_dias` (int nullable)
- [x] Crear entidad `PacientePatologia` (paciente_id, patologia_id, tratamiento varchar nullable) — NO @ManyToMany simple, sino entidad separada con campo `tratamiento`
- [x] Crear tabla `paciente_necesidad` (@ManyToMany simple Paciente ↔ CatalogoNecesidad, sin campos extra)
- [x] Agregar rol `encuestador` al enum de roles (backend enum `Rol`)
- [x] Ejecutar migración (synchronize en desarrollo)

### Fase 4 — Backend: Endpoints de censo y seed

- [x] Modificar `CrearPacienteDto` para aceptar: `tiene_discapacidad_motora`, `edad_meses`, `edad_dias`, `patologias` (array de `{ patologia_id, tratamiento }`), `necesidad_ids`
- [x] Modificar `ActualizarPacienteDto` para aceptar campos nuevos
- [x] Modificar `PacientesService.createPaciente()` para guardar `PacientePatologia` (con tratamiento) y `paciente_necesidad`
- [x] Modificar `PacientesService.updatePaciente()` para actualizar relaciones
- [x] Crear endpoint `GET /api/v1/censo/estadisticas` con todas las métricas agregadas (incluye clasificación etaria y agrupación por ubicación)
- [x] Crear `POST /api/v1/censo/carpas` — crear carpa (NucleoFamiliar con codigo_carpa generado automáticamente tipo `CARPA-{SEQ}`)
- [x] Crear `GET /api/v1/censo/carpas` — listar carpas con filtros
- [x] Crear `GET /api/v1/censo/carpas/:codigo` — obtener carpa por código (con miembros)
- [x] **Seed de medicamentos genéricos**: 24 medicamentos comunes (paracetamol, ibuprofeno, amoxicilina, omeprazol, losartán, metformina, salbutamol, enalapril, atorvastatina, etc.) integrado en `DatabaseSeedService`

### Fase 5 — Frontend: Modelos y servicios

- [x] Agregar `ENCUESTADOR = 'encuestador'` a `shared/enums/rol.enum.ts`
- [x] Agregar `tiene_discapacidad_motora` a `CreatePacienteDto` y `Paciente` en `shared/models/paciente.model.ts`
- [x] Agregar `patologia_ids`, `necesidad_ids` a `CreatePacienteDto`
- [x] Crear `shared/models/patologia.model.ts`
- [x] Crear `shared/models/necesidad.model.ts`
- [x] Agregar `codigo_carpa`, `ubicacion` a modelo `NucleoFamiliar` (crear si no existe)
- [x] Extender `PacientesService` abstract:
  - `abstract getPatologias(): Observable<Patologia[]>`
  - `abstract getNecesidades(): Observable<Necesidad[]>`
  - `abstract getEstadisticasCenso(): Observable<CensoEstadisticas>`
  - `abstract crearCarpa(dto): Observable<NucleoFamiliar>`
  - `abstract listarCarpas(): Observable<NucleoFamiliar[]>`
  - `abstract getCarpaByCodigo(codigo: string): Observable<NucleoFamiliar>`
- [x] Implementar en `ApiPacientesService`
- [x] Implementar en `MockPacientesService`
- [x] Extender `AdministracionService` con CRUD de patologías y necesidades

### Fase 6 — Frontend: Roles y navegación

- [x] Agregar `encuestador` al menú lateral (`app.ts`):
  - `/censo/crear-carpa`
  - `/censo/tablero`
- [x] Agregar guards para `encuestador` en rutas de censo
- [x] Crear `censo/censo.routes.ts` con lazy loading
- [x] Registrar ruta `/censo` en `app.routes.ts`

### Fase 7 — Frontend: Registro de carpa

- [x] Crear `censo/pages/crear-carpa.page.ts`:
  - Formulario: ubicación (texto)
  - Al guardar: POST a backend → recibe `codigo_carpa` generado
  - Muestra código de carpa generado
  - Botón "Registrar paciente en esta carpa" → navega a detalle
  - Estados: loading, empty, error
- [x] Crear `censo/modals/registrar-paciente-carpa.modal.ts`:
  - Similar a `RegistroPacienteModal` pero asociado a una carpa
  - Campo `relacion`, `tiene_discapacidad_motora`, multi-select patologías con tratamiento, multi-select necesidades
  - Al guardar: registra paciente + agrega miembro a carpa via `POST /censo/carpas/:codigo/miembros`
- [x] Backend: `POST /censo/carpas/:codigo/miembros` — endpoint + DTO + service method
- [x] FAB "Agregar miembro" en `detalle-carpa.page.ts` que abre el modal y refresca
- [x] (Aplazado) Filtrar lista-pacientes por carpa — se maneja desde el módulo censo
- [x] **Fix toggles**: catálogos de patologías/necesidades ahora usan arrays planos con `[(ngModel)]` directo (sin señales), resolviendo el bug de reactividad

### Fase 7b — Lista de carpas + editar/eliminar
- [x] Crear `censo/pages/listar-carpas.page.ts` — página con lista de carpas, editar ubicación (modal), eliminar (confirmación)
- [x] Backend: `PATCH /censo/carpas/:codigo` y `DELETE /censo/carpas/:codigo`
- [x] Agregar ruta `/censo/carpas` en `censo.routes.ts`
- [x] Cambiar menú de `/censo/crear-carpa` a `/censo/carpas`

### Fase 7c — Refactor modelo etario
- [x] Backend: reemplazar `edadMeses`/`edadDias` por `fechaNacimiento`/`edadManual`/`esRecienNacido` en entity, DTOs y service
- [x] Backend: `getEstadisticas()` ahora calcula edades in-memory usando nuevos campos
- [x] Frontend: modelos `Paciente`/`CreatePacienteDto` actualizados
- [x] Frontend: todos los modales usan `ion-datetime-button` + toggle "No sé fecha exacta" + toggle "Es recién nacido"
- [x] Frontend: `formatearEdad()` en detalle-carpa y detalle-paciente con nueva lógica
- [x] Frontend: `EditarPacienteModal` actualizado con nuevos campos

### Fase 8 — Frontend: Tablero estadístico

- [x] Crear `censo/pages/tablero.page.ts`:
  - Tabla HTML con métricas (6 secciones)
  - Botón exportar a CSV
  - Estados: loading, empty, error
- [x] Crear modelo `CensoEstadisticas` con todas las métricas tipadas

### Fase 9 — Frontend: Detalle de carpa

- [x] Crear `censo/pages/detalle-carpa.page.ts`:
  - Muestra información de la carpa (código, ubicación)
  - Lista de miembros con datos (edad, sexo, patologías, necesidades, discapacidad)
  - Estados: loading, empty, error

### Fase 10 — Frontend: CRUD catálogos (admin)

- [x] Crear `admin/pages/patologias.page.ts` — lista + modal crear
- [x] Crear `admin/pages/necesidades.page.ts` — lista + modal crear
- [x] Agregar enlaces en menú de admin (`app.ts` + `administracion.routes.ts`)

### Fase 11 — Offline sync

- [ ] (Aplazado) Crear `core/services/sync.service.ts`:
  - Detecta online/offline via `window.addEventListener('online'/'offline')`
  - Cola en localStorage: `{ id, action, endpoint, body, timestamp }`
  - Al estar offline: guarda operación en cola
  - Al volver online: replay FIFO, muestra notificación toast
- [ ] (Aplazado) Integrar `SyncService` en flujo de registro de carpa/paciente
- [ ] (Aplazado) Badge "Pendientes: N" en header del módulo censo

### Verificación final

- [x] `nx lint backend` — 0 errors, 0 warnings
- [x] `nx lint frontend` — 0 errors, 0 warnings
- [x] `nx test backend` — 6/6 tests pasan (ambas tandas)
- [x] `nx test frontend` — 38/38 tests pasan (ambas tandas)
- [x] `nx build frontend` — build exitoso
- [x] `nx build backend` — build exitoso
- [ ] Prueba manual: crear carpa → registrar pacientes con patologías/necesidades → ver tablero → exportar CSV → editar/eliminar carpa

---

## 4. Rutas del módulo Censo

| Ruta | Página | Rol |
|---|---|---|
| `/censo/crear-carpa` | CrearCarpaPage | encuestador, admin |
| `/censo/tablero` | TableroPage | encuestador, recepcionista, admin |
| `/censo/carpa/:codigo` | DetalleCarpaPage | encuestador, recepcionista, admin |
| `/admin/patologias` | GestionPatologiasPage | admin |
| `/admin/necesidades` | GestionNecesidadesPage | admin |

---

## 5. Estructura de archivos nueva

```
apps/frontend/src/app/
  censo/
    censo.routes.ts
    pages/
      crear-carpa.page.ts
      tablero.page.ts
      detalle-carpa.page.ts
    modals/
      registrar-paciente-carpa.modal.ts
    components/
      tabla-estadisticas.component.ts
    services/
      censo.service.ts
  admin/
    pages/
      patologias.page.ts
      necesidades.page.ts
    modals/
      crear-patologia.modal.ts
      crear-necesidad.modal.ts
  core/
    services/
      sync.service.ts

apps/backend/src/app/
  censo/
    censo.module.ts
    censo.controller.ts
    censo.service.ts
    dto/
      estadisticas.dto.ts
      crear-carpa.dto.ts
  patologia/
    patologia.module.ts
    patologia.controller.ts
    patologia.service.ts
    entities/
      patologia.entity.ts
    dto/
      crear-patologia.dto.ts
      actualizar-patologia.dto.ts
  necesidad/
    necesidad.module.ts
    necesidad.controller.ts
    necesidad.service.ts
    entities/
      necesidad.entity.ts
    dto/
      crear-necesidad.dto.ts
      actualizar-necesidad.dto.ts
```

---

## 6. Dependencias

- `qrcode` — ya existe en el proyecto (para QR de carpa)
- Sin nuevas dependencias de gráficos (tablas y números)
- `file-saver` (opcional) — para exportar CSV
