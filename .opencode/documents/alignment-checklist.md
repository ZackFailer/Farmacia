# Checklist de Alineación Backend ↔ Frontend

> **Propósito**: Checklist secuencial para corregir todas las incongruencias detectadas entre backend y frontend. Cada fase debe completarse en orden; fases posteriores pueden depender de anteriores.

---

## Fase 0: Preparación

- [ ] Crear rama de trabajo: `git checkout -b fix/alignment-backend-frontend`
- [x] Leer `pacientes.service.ts` y confirmar JOINs faltantes
- [x] Leer TODOS los `*.service.api.ts` del frontend para detectar `Api*` interfaces desactualizadas
- [x] Leer TODOS los modelos `shared/models/*.model.ts` vs entidades backend
- [ ] Hacer backup de la DB actual (`cp data/apopharma.db data/apopharma.db.bak`)

---

## Fase 1: 🔴 CRITICAL — Bug `familiares[].paciente`

### 1.1 Backend — Agregar JOIN faltante en `searchPacientes`

**Archivo**: `apps/backend/src/app/pacientes/pacientes.service.ts`

- [x] En `searchPacientes()` (~linea 106), agregar:
  ```ts
  .leftJoinAndSelect('nfm.paciente', 'nfm_paciente')
  ```
  Después de `.leftJoinAndSelect('p.familiares', 'nfm')`

### 1.2 Backend — Agregar `paciente: true` en `relations` de `findOne`

**Archivo**: `apps/backend/src/app/pacientes/pacientes.service.ts`

- [x] En `getPacienteByIdEmergencia()` (~linea 91), cambiar:
  ```ts
  relations: { familiares: { nucleo: { miembros: { paciente: true }, titular: true } } }
  ```
  a:
  ```ts
  relations: { familiares: { paciente: true, nucleo: { miembros: { paciente: true }, titular: true } } }
  ```
- [x] En `loadPacienteConNucleo()` (~linea 202), mismo cambio

### 1.3 Frontend — Hacer `toFamiliar()` resiliente

**Archivo**: `apps/frontend/src/app/pacientes/services/pacientes.service.api.ts`

- [x] Modificar `toFamiliar()` para que busque `pf.paciente` con fallback a `pf.nucleo?.miembros?.find(m => m.pacienteId === pf.pacienteId)?.paciente`
- [x] Si no encuentra data, retornar un `Familiar` mínimo o lanzar error controlado

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Mismo fix en `toFamiliar()` (~linea 291-306)

### Verificación Fase 1

- [x] Build backend: `npx nx build backend` — sin errores
- [x] Build frontend: `npx nx build frontend --configuration=development` — sin errores
- [ ] Probar POST paciente con familiar: crear Paul + Diana → sin error, datos correctos
- [ ] Probar search: buscar "diana" → aparece en lista
- [ ] Probar detalle: buscar por QR/idEmergencia `EM-2026-001` → carga con núcleo familiar

---

## Fase 2: 🔴 CRITICAL — Bug transaccional `generateNextEmergenciaId()`

### 2.1 Backend — Pasar transaction manager a la generación de IDs

**Archivo**: `apps/backend/src/app/pacientes/pacientes.service.ts`

- [x] Refactorizar `generateNextEmergenciaId()` para aceptar `manager?: EntityManager`
- [x] Si recibe `manager`, usar `manager.getRepository(Paciente)` para la query
- [x] Si no recibe `manager`, usar `this.pacienteRepository` (comportamiento actual)
- [x] Modificar `savePacienteWithUniqueId()` para aceptar y pasar `manager`
- [x] En `createPaciente()`, al llamar `savePacienteWithUniqueId()` dentro de la transacción, pasar `manager`

### Verificación Fase 2

- [x] Build backend: sin errores
- [ ] Probar: crear titular + 2+ familiares → todos con IDs secuenciales únicos (EM-2026-003, EM-2026-004, etc.)
- [ ] Probar: crear paciente sin familiar → ID correcto
- [ ] Probar: crear paciente con `idEmergencia` fijo → no colisiona

---

## Fase 3: 🟠 ALTA — Mappers desactualizados en `dispensacion.service.api.ts`

### 3.1 Frontend — Actualizar `ApiMedicamento`

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Agregar campos a `ApiMedicamento`:
  ```ts
  unidadConcentracion: string;
  esVital: boolean;
  activo: boolean;
  ```
- [x] Actualizar `toMedicamento()` para mapear `unidadConcentracion`, `esVital`, `activo`
- [x] Eliminar hardcode `unidad_concentracion: 'mg'`

### 3.2 Frontend — Actualizar `ApiLote`

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Agregar `activo: boolean` a `ApiLote`
- [x] Actualizar `toLote()` para mapear `activo`

### 3.3 Frontend — Actualizar `ApiPacienteSimple`

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Agregar `activo: boolean` a `ApiPacienteSimple`
- [x] (no necesita cambio en mapper porque `Paciente` model ya tiene `activo?: boolean`)

### 3.4 Frontend — Actualizar `ApiDispensacion` y model `Dispensacion`

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Agregar a `ApiDispensacion`:
  ```ts
  recetaId: number | null;
  activo: boolean;
  ```

**Archivo**: `apps/frontend/src/app/shared/models/dispensacion.model.ts`

- [x] Agregar a `Dispensacion`:
  ```ts
  receta_id?: number;
  activo?: boolean;
  ```

- [x] Actualizar `toDispensacion()` para mapear los nuevos campos

### Verificación Fase 3

- [x] Build frontend: sin errores
- [x] TypeScript strict check: ningún campo `undefined` inesperado en templates
- [x] Revisar templates que acceden `d.items[].medicamento_nombre` y `d.items[].lote_codigo` — deben seguir funcionando

---

## Fase 4: 🟠 ALTA — Modelos faltantes en shared

### 4.1 Frontend — Agregar `activo` a `Configuracion`

**Archivo**: `apps/frontend/src/app/shared/models/configuracion.model.ts`

- [x] Agregar `activo?: boolean` a interface `Configuracion`

### 4.2 Frontend — Verificar `ApiConfiguracion` en todos los servicios

**Archivos**: 
- `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts` (~linea 126-133)
- `apps/frontend/src/app/inventario/services/inventario.service.api.ts`
- `apps/frontend/src/app/administracion/services/administracion.service.api.ts`

- [x] Verificar que `ApiConfiguracion` incluya `activo: boolean`
- [x] Verificar que `toConfiguracion()` mapee el campo
- [x] Si algún servicio no tiene `activo`, agregarlo

### 4.3 Frontend — Verificar `ApiDispensacion` en historial

**Archivo**: `apps/frontend/src/app/historial/services/historial.service.api.ts`

- [x] Verificar que `ApiDispensacion` tenga `recetaId`, `activo`
- [x] Verificar que `toDispensacion()` mapee correctamente

### Verificación Fase 4

- [x] Build frontend: sin errores
- [x] Check que `configuracion.activo` no rompa ningún template (es optional, no debería)

---

## Fase 5: 🟡 MEDIA — Flujos rotos

### 5.1 Frontend — `getLoteByQR()` ineficiente

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

**Opción A (Backend nuevo endpoint)**:
- [x] Crear en `apps/backend/src/app/recepcion/recepcion.controller.ts`:
  ```ts
  @Get('lotes/qr/:codigo')
  getLoteByQR(@Param('codigo') codigo: string) {
    return this.recepcionService.getLoteByQR(codigo);
  }
  ```
- [x] Implementar `getLoteByQR()` en `RecepcionService`:
  ```ts
  async getLoteByQR(codigoQr: string): Promise<Lote> {
    const lote = await this.loteRepository.findOne({ where: { codigoQr }, relations: { medicamento: true } });
    if (!lote) throw new NotFoundException('Lote no encontrado');
    return lote;
  }
  ```
- [x] Actualizar frontend para usar `GET /lotes/qr/:codigo`

**Opción B (Frontend solo)**:
- [ ] Agregar filtro de backend: `GET /lotes?codigoQr=...` (simplificado)
- [ ] Actualizar `dispensacion.service.api.ts` para usar el endpoint filtrado

### 5.2 Backend — `getDoseConfig()` no debe devolver 404

**Archivo**: `apps/backend/src/app/dispensacion/dispensacion.service.ts`

- [x] Cambiar `getDoseConfig()` para retornar `null` en vez de lanzar `NotFoundException` cuando no existe configuración
- [ ] O mantener 404 pero que el frontend lo maneje con `catchError`

### 5.3 Frontend — Manejar error en `getLimiteDosis()`

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Agregar `pipe(catchError(() => of(null)))` para convertir 404 en `null`

**Archivo**: `apps/frontend/src/app/dispensacion/pages/paso3-confirmar.page.ts`

- [x] Envolver `firstValueFrom(this.dispensacionService.getLimiteDosis(...))` en try/catch (aunque el servicio ya devuelva null, por si hay otros errores)

### 5.4 Frontend — Enviar `observaciones` en creación de dispensación

**Archivo**: `apps/frontend/src/app/dispensacion/pages/paso3-confirmar.page.ts`

- [x] Agregar campo `observaciones` al `CreateDispensacionDto`:
  ```ts
  const dto: CreateDispensacionDto = {
    paciente_id: estado.paciente.id,
    receta_id: estado.recetaId,
    observaciones: this.observaciones(), // o un campo del form
    items: ...
  };
  ```

### 5.5 Backend — Agregar `@Roles` a RecetasController

**Archivo**: `apps/backend/src/app/recetas/recetas.controller.ts`

- [x] Agregar decorador a nivel de clase:
  ```ts
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  ```
- [x] Roles por método ya existían y son correctos (cada método tiene su propio @Roles)

### 5.6 Backend — Eliminar DTO duplicado de dispensación

**Archivo**: `apps/backend/src/app/dispensacion/dto/crear-paciente.dto.ts`

- [x] Eliminar archivo (está duplicado de `pacientes/dto/crear-paciente.dto.ts`)
- [x] Verificar que ningún archivo lo importe (grep confirmó que no) — no requiere cambio en imports

**Nota**: Verificar que el DTO de `dispensacion` no tenga diferencias intencionales vs el de `pacientes`. Si las hay, mergear campos faltantes (ej: `telefono`) antes de eliminar.

### 5.7 Frontend — Robustecer `buscarPaciente()` en dispensación

**Archivo**: `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts`

- [x] Cambiar `buscarPaciente()` para retornar `Observable<Paciente[]>` en vez de `Observable<Paciente>`
- [x] Actualizar abstract service, mock, API service, modal y spec

### Verificación Fase 5

- [x] Build backend + frontend: sin errores
- [ ] Probar flujo completo dispensación: paso1(seleccionar paciente) → paso2(seleccionar med + lote) → paso3(confirmar) → éxito
- [ ] Probar `getLimiteDosis()` sin configuración → no rompe flujo
- [ ] Probar creación de receta con rol DOCTOR → OK
- [ ] Probar creación de receta con rol RECEPTIONIST → 403

---

## Fase 6: 🟢 BAJA — Deuda técnica

### 6.1 Frontend — Eliminar modal duplicado

**Archivo**: `apps/frontend/src/app/dispensacion/modals/busqueda-paciente.modal.ts`

- [x] Verificar que ningún archivo importe desde esta ruta
- [x] Si no se usa, eliminar archivo

### 6.2 Frontend — Centralizar interfaces `Api*`

**Opcional / Refactor futuro**

- [ ] Crear `apps/frontend/src/app/shared/models/api/` directorio
- [ ] Mover interfaces `ApiPaciente`, `ApiMedicamento`, `ApiLote`, `ApiReceta`, `ApiDispensacion`, etc.
- [ ] Importar desde allí en todos los `*.service.api.ts`
- [ ] Beneficio: un solo lugar de verdad para la forma de los datos que llegan del backend

### 6.3 Frontend — Revisar `despachado_por` en `DetalleDispensacionModal`

**Archivo**: `apps/frontend/src/app/historial/modals/detalle-dispensacion.modal.ts`

- [x] Verificar qué campos del model `Dispensacion` accede el template — usa `despachado_por`
- [x] `historial.service.api.ts:toDispensacion()` ya provee `despachado_por` desde `usuario.nombre`
- [x] `dispensacion.service.api.ts:toDispensacion()` no tiene usuario en ApiDispensacion, pero `despachado_por` es opcional en el model — undefined es válido

### Verificación Fase 6

- [x] Build frontend: sin errores
- [x] Verificar que ningún import esté roto

---

## Fase 7: Verificación final

### 7.1 Build

- [x] `npx nx lint backend` — sin errores (solo preexistentes)
- [x] `npx nx lint frontend` — sin errores (solo preexistentes)
- [x] `npx nx build backend` — build exitoso
- [x] `npx nx build frontend --configuration=development` — build exitoso

### 7.2 Smoke tests manuales

- [ ] Login con admin/123456 → OK
- [ ] Crear paciente sin familiar → OK, aparece en búsqueda
- [ ] Crear paciente con 1 familiar → OK, sin error, ambos aparecen
- [ ] Crear paciente con 2+ familiares → OK, IDs secuenciales
- [ ] Buscar paciente por nombre parcial → resultados correctos
- [ ] Buscar paciente por QR → detalle con núcleo familiar
- [ ] Editar paciente (nombre, activo) → OK
- [ ] Eliminar paciente (admin: hard, resto: soft) → OK
- [ ] Crear medicamento con todas las opciones → OK
- [ ] Buscar medicamento en catálogo → muestra correctamente
- [ ] Registrar lote con QR → OK
- [ ] Ver detalle de lote con QR real → OK
- [ ] Panel de stock → muestra medicamentos vitales correctamente
- [ ] Configurar umbral en Configuración General → OK
- [ ] Flujo dispensación completo (3 pasos) → OK
- [ ] Historial del paciente → muestra dispensaciones anteriores

### 7.3 Commit

- [ ] `git add .`
- [ ] `git commit -m "fix: alinear backend y frontend - relations, mappers, dtos y flujos"`
- [ ] `git push origin fix/alignment-backend-frontend`

---

## Resumen de archivos a modificar

| # | Archivo | Fase | Cambio |
|---|---|---|---|
| 1 | `backend/.../pacientes.service.ts` | 1, 2 | Agregar JOINs + manager transaccional |
| 2 | `frontend/.../pacientes.service.api.ts` | 1 | Resiliencia en `toFamiliar()` |
| 3 | `frontend/.../dispensacion.service.api.ts` | 1, 3, 5 | Mappers + `catchError` + `getLoteByQR` |
| 4 | `frontend/.../dispensacion.model.ts` | 3 | Agregar `receta_id`, `activo` |
| 5 | `frontend/.../configuracion.model.ts` | 4 | Agregar `activo` |
| 6 | `frontend/.../paso3-confirmar.page.ts` | 5 | Enviar `observaciones`, try/catch |
| 7 | `backend/.../dispensacion.service.ts` | 5 | `getDoseConfig` retornar null |
| 8 | `backend/.../recetas.controller.ts` | 5 | Agregar `@Roles` a nivel de clase |
| 9 | `backend/.../dispensacion/dto/crear-paciente.dto.ts` | 5 | Eliminar duplicado |
| 10 | `frontend/.../dispensacion/modals/busqueda-paciente.modal.ts` | 6 | Eliminar si no se usa |
| 11 | `frontend/.../historial.service.api.ts` | 4 | Verificar `ApiDispensacion` |
