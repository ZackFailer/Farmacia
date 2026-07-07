# Plan de Implementación — Checklist

> Basado en decisiones tomadas el 2026-07-06.
> Patrón de eliminación: Admin hard-delete (DELETE), resto soft-delete (PATCH activo: false). Admin ve inactivos con `?incluirInactivos=true`.

---

## Fase 1: Username + Login con PIN ✅

### 1.1 Backend — Usuario entity

- [x] `apps/backend/src/app/common/entities/usuario.entity.ts`
  - [x] Agregar columna:
    ```typescript
    @Column({ type: 'varchar', length: 50, unique: true })
    username!: string;
    ```

### 1.2 Backend — Login DTO

- [x] `apps/backend/src/app/auth/dto/login.dto.ts`
  - [x] Agregar campo:
    ```typescript
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username!: string;
    ```

### 1.3 Backend — Auth controller

- [x] `apps/backend/src/app/auth/auth.controller.ts`
  - [x] Cambiar `login(@Body() dto: LoginDto)` → pasar `dto.username` y `dto.pin`

### 1.4 Backend — Auth service

- [x] `apps/backend/src/app/auth/auth.service.ts`
  - [x] Cambiar firma: `async login(username: string, pin: string)`
  - [x] Buscar por `{ where: { username, activo: true } }` en vez de iterar todos
  - [x] Si no encuentra → `UnauthorizedException`
  - [x] Si PIN no coincide → `UnauthorizedException`
  - [x] JWT payload: agregar `username`

### 1.5 Backend — Usuario DTOs (admin)

- [x] `apps/backend/src/app/administracion/dto/crear-usuario.dto.ts`
  - [x] Agregar campo:
    ```typescript
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Solo letras, números y guión bajo' })
    username!: string;
    ```
- [x] `apps/backend/src/app/administracion/dto/actualizar-usuario.dto.ts`
  - [x] Agregar campo opcional:
    ```typescript
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[a-zA-Z0-9_]+$/)
    username?: string;
    ```

### 1.6 Backend — Admin service (usuarios)

- [x] `apps/backend/src/app/administracion/administracion.service.ts`
  - [x] `getUsuarios()` — incluir `username` en respuesta
  - [x] `createUsuario()` — guardar `username` en entidad
  - [x] `updateUsuario()` — permitir actualizar `username`

### 1.7 Backend — Seed

- [x] `apps/backend/src/app/common/database-seed.service.ts`
  - [x] Seed usuario admin con `{ nombre: 'Administrador', username: 'admin', rol: 'admin', pin: '123456' }`
  - [x] Seed usuario humberto con `{ nombre: 'Humberto Farías', username: 'humber_farias', rol: 'recepcionista_med', pin: '123456' }`

### 1.8 Frontend — Modelo Usuario

- [x] `apps/frontend/src/app/shared/models/usuario.model.ts`
  - [x] `Usuario`: agregar `username: string`
  - [x] `CreateUsuarioDto`: agregar `username: string`
  - [x] `UpdateUsuarioDto`: agregar `username?: string`

### 1.9 Frontend — Auth service abstracto

- [x] `apps/frontend/src/app/auth/services/auth.service.ts`
  - [x] Cambiar firma: `abstract login(username: string, pin: string): Observable<LoginResponse>`

### 1.10 Frontend — Auth service API

- [x] `apps/frontend/src/app/auth/services/auth.service.api.ts`
  - [x] Enviar `{ username, pin }` al POST `/auth/login`

### 1.11 Frontend — Auth service mock

- [x] `apps/frontend/src/app/auth/services/auth.service.mock.ts`
  - [x] Validar username + PIN contra lista hardcodeada
  - [x] Devolver mock response con username

### 1.12 Frontend — Login Page

- [x] `apps/frontend/src/app/auth/pages/login.page.ts`
  - [x] Agregar `username` signal
  - [x] Template: `ion-input` para username encima del teclado numérico
  - [x] Label: "Nombre de usuario"
  - [x] Placeholder: "ej: admin"
  - [x] Teclado numérico se desbloquea solo si username no vacío
  - [x] Llamar `authService.login(username(), pin())` con ambos campos
  - [x] Mantener teclado numérico existente para PIN

### 1.13 Frontend — Crear/Editar Usuario Modal

- [x] `apps/frontend/src/app/administracion/modals/crear-editar-usuario.modal.ts`
  - [x] Agregar `ion-input` con `position="stacked"` para "Nombre de usuario"
  - [x] Validación: required, patrón `^[a-zA-Z0-9_]+$`
  - [x] Precargar valor en modo edición

### 1.14 Frontend — Gestion Usuarios (tabla)

- [x] `apps/frontend/src/app/administracion/pages/gestion-usuarios.page.ts`
  - [x] Mostrar `@{{ u.username }}` debajo del nombre

---

## Fase 2: Catálogo de Medicamentos ✅

### 2.1 Backend — DTOs de actualización

- [x] CREAR `apps/backend/src/app/recepcion/dto/actualizar-medicamento.dto.ts`
- [x] CREAR `apps/backend/src/app/recepcion/dto/actualizar-lote.dto.ts`

### 2.2 Backend — Recepción controller

- [x] `apps/backend/src/app/recepcion/recepcion.controller.ts`
  - [x] `PATCH /medicamentos/:id` — `updateMedicamento(id, dto)`
  - [x] `DELETE /medicamentos/:id` — solo admin, hard delete
  - [x] `GET /medicamentos` — query param `incluirInactivos`
  - [x] `PATCH /lotes/:id` — `updateLote(id, dto)`
  - [x] `DELETE /lotes/:id` — solo admin, hard delete

### 2.3 Backend — Recepción service

- [x] `apps/backend/src/app/recepcion/recepcion.service.ts`
  - [x] `getMedicamentos(search?, incluirInactivos?)`
  - [x] `updateMedicamento(id, dto)` — incluye campo `activo` para soft-delete
  - [x] `deleteMedicamento(id)` — `remove()` (hard delete)
  - [x] `getLotes(page?, limit?, incluirInactivos?)`
  - [x] `updateLote(id, dto)`
  - [x] `deleteLote(id)` — `remove()` (hard delete)

### 2.4 Frontend — Recepción service abstracto

- [x] `apps/frontend/src/app/recepcion/services/recepcion.service.ts`
  - [x] Agregar métodos: `actualizarMedicamento`, `eliminarMedicamento`, `actualizarLote`
  - [x] Actualizar `getMedicamentos` y `getLotes` con `incluirInactivos`

### 2.5 Frontend — Recepción service API

- [x] `apps/frontend/src/app/recepcion/services/recepcion.service.api.ts`
  - [x] Implementar `actualizarMedicamento` → PATCH
  - [x] Implementar `eliminarMedicamento` → DELETE
  - [x] Implementar `actualizarLote` → PATCH
  - [x] `getMedicamentos` con query param `incluirInactivos`
  - [x] `getLotes` con query param `incluirInactivos`

### 2.6 Frontend — Recepción service mock

- [x] `apps/frontend/src/app/recepcion/services/recepcion.service.mock.ts`
  - [x] Mock de `actualizarMedicamento`
  - [x] Mock de `eliminarMedicamento`
  - [x] Mock de `actualizarLote`

### 2.7 Frontend — Página Catálogo de Medicamentos

- [x] CREAR `apps/frontend/src/app/recepcion/pages/catalogo-medicamentos.page.ts`
  - [x] Header con back button, title "Catálogo"
  - [x] Searchbar con debounce
  - [x] Toggle "Ver inactivos" (solo admin)
  - [x] Lista con nombre, presentación, concentración
  - [x] Botón + en header para crear nuevo medicamento
  - [x] Botón Editar (abre `EditarMedicamentoModal`)
  - [x] Botón Eliminar (admin: hard-delete, resto: soft-delete)
  - [x] Botón Reactivar (admin, inactivos)
  - [x] Estados loading, empty, error

### 2.8 Frontend — Modal Editar Medicamento

- [x] CREAR `apps/frontend/src/app/recepcion/modals/editar-medicamento.modal.ts`
  - [x] Header, form, footer con Cancelar/Guardar
  - [x] Precarga valores via `@Input()`
  - [x] Output `'confirm'` con datos actualizados

### 2.9 Frontend — Rutas

- [x] `apps/frontend/src/app/recepcion/recepcion.routes.ts`
  - [x] Ruta `catalogo` → `CatalogoMedicamentosPage`

### 2.10 Frontend — Botón en Dashboard

- [x] `apps/frontend/src/app/recepcion/pages/dashboard-ingresos.page.ts`
  - [x] Botón en header (slot end) con icono `file-tray-stacked-outline`
  - [x] Navega a `/recepcion/catalogo`

---

## Fase 3: Umbral editable en Configuración General ✅

### 3.1 Frontend — Modal Límites de Dosis

- [x] `apps/frontend/src/app/administracion/modals/limites-dosis.modal.ts`
  - [x] Agregar campo:
    ```html
    <ion-item>
      <ion-label position="stacked">Umbral mínimo (unds) *</ion-label>
      <ion-input formControlName="umbralMinimo" type="number" min="0"></ion-input>
    </ion-item>
    ```
  - [x] FormGroup: agregar `umbralMinimo` con `Validators.required`, `Validators.min(0)`
  - [x] Al abrir modal: precargar `umbral_minimo` si existe
  - [x] Al guardar: incluir `umbralMinimo` en el DTO
  - [x] Cambiar título del modal de "Límite de Dosis" a "Configurar Medicamento" (más genérico para incluir umbral)

### 3.2 Frontend — Configuración General page

- [x] `apps/frontend/src/app/administracion/pages/configuracion-general.page.ts`
  - [x] En sección "Umbrales de Stock": reemplazar texto plano `<p>Umbral mínimo...</p>` por botón "Editar"
  - [x] Botón abre `LimitesDosisModal` con la config seleccionada
  - [x] Al confirmar edición: refrescar lista

---

## Fase 4: Hard Delete + Soft Delete + Inactivos (Admin) ✅

> Este fase aplica el patrón consistente a TODOS los módulos.

### 4.1 Backend — Pacientes

- [x] `apps/backend/src/app/pacientes/pacientes.controller.ts`
  - [x] `GET /pacientes` — agregar query param `incluirInactivos?: boolean`
  - [x] `DELETE /pacientes/:id` — cambiar a `@Roles(UserRole.ADMIN)` y hard-delete (`remove()`)
- [x] `apps/backend/src/app/pacientes/pacientes.service.ts`
  - [x] `getPacientes(search?, incluirInactivos?)` — omitir filtro `activo` si `incluirInactivos`
  - [x] `deletePaciente(id)` — `remove()` en vez de soft delete

### 4.2 Backend — Usuarios

- [x] `apps/backend/src/app/administracion/administracion.controller.ts`
  - [x] `GET /usuarios` — agregar `incluirInactivos?: boolean`
- [x] `apps/backend/src/app/administracion/administracion.service.ts`
  - [x] `getUsuarios(incluirInactivos?)` — ajustar query; agregar `activo` al select
  - [x] `deleteUsuario(id)` — hard-delete (`remove()`)

### 4.3 Backend — Medicamentos y Lotes

- [x] Ya cubierto en Fase 2 (sección 2.2, 2.3)

### 4.4 Frontend — Listados con toggle "Ver inactivos"

- [x] `apps/frontend/src/app/pacientes/pages/lista-pacientes.page.ts`
  - [x] Agregar toggle "Ver inactivos" (solo visible para admin)
  - [x] Pasar `incluirInactivos` al servicio
  - [x] Items inactivos mostrar estilo visual diferente (opacidad/color)
  - [x] Botón "Reactivar" en items inactivos (solo admin)
  - [x] Botón "Eliminar" cambia según rol: admin → hard-delete con confirmación; resto → soft-delete con mensaje
- [x] `apps/frontend/src/app/administracion/pages/gestion-usuarios.page.ts`
  - [x] Mismo patrón: toggle, estilo inactivos, reactivar, eliminar
- [x] `apps/frontend/src/app/recepcion/pages/catalogo-medicamentos.page.ts`
  - [x] Ya cubierto en Fase 2 (sección 2.7)

### 4.5 Frontend — Servicios

- [x] `apps/frontend/src/app/pacientes/services/pacientes.service.ts`
  - [x] Agregar `incluirInactivos?: boolean` a `buscarPaciente()`
- [x] `apps/frontend/src/app/administracion/services/administracion.service.ts`
  - [x] Agregar `incluirInactivos?: boolean` a `getUsuarios()`

---

## Fase 5: Build + Verificación

### 5.1 Backend

- [ ] `npx nx build backend` — sin errores
- [ ] `npx nx serve backend` — arranca sin errores
- [ ] Probar endpoints con curl/Postman:
  - [ ] POST `/auth/login` con username + pin → JWT
  - [ ] DELETE `/medicamentos/:id` como admin → hard delete
  - [ ] GET `/medicamentos?incluirInactivos=true` → incluye eliminados
  - [ ] PATCH `/pacientes/:id/activar` → reactivar (opcional, se puede hacer con PATCH `{ activo: true }`)

### 5.2 Frontend

- [ ] `npx nx lint frontend` — sin errores
- [ ] `npx nx build frontend` — sin errores
- [ ] `npx nx serve frontend` — arranca sin errores
- [ ] Probar login con username + PIN
- [ ] Probar catálogo de medicamentos
- [ ] Probar toggle ver inactivos (admin)
- [ ] Probar soft delete como no-admin
- [ ] Probar hard delete como admin
- [ ] Probar reactivar registro como admin

### 5.3 Termux

- [ ] Copiar dist + start.js a Termux
- [ ] Probar `node --experimental-sqlite start.js` → arranca
- [ ] Probar flujo completo desde el celular
