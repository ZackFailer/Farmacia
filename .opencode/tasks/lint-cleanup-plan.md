# Plan de Limpieza de Lint — ApoPharma

> Creado: 2026-07-06
> Objetivo: Reducir 80 errores + 52 warnings frontend, 2 errores + 6 warnings backend a 0.
> Estrategia: Una tanda por bloque, resolviendo primero lo automático y de alto impacto.

---

## Resumen

| Entorno | Errors | Warnings | Auto-fix |
|---|---|---|---|
| Frontend | **80** | **52** | 6 |
| Backend | **2** | **6** | 0 |
| **Total** | **82** | **58** | **6** |

---

## Tanda 1 — Auto-fix (`--fix`)

**Errores eliminados: 5 | Warnings: 0**

Cosas que ESLint puede corregir solo:

| Archivo | Línea | Regla | Acción |
|---|---|---|---|
| `administracion/services/administracion.service.mock.ts` | 9 | `prefer-const` | `let usuarios` → `const usuarios` |
| `administracion/services/administracion.service.mock.ts` | 35 | `prefer-const` | `let pinStore` → `const pinStore` |
| `recepcion/services/recepcion.service.mock.ts` | 8 | `prefer-const` | `let MEDICAMENTOS` → `const MEDICAMENTOS` |
| `shared/components/buscador.component.ts` | 28 | `no-empty-object-type` | `{}` → `object` |
| `recepcion/modals/nuevo-medicamento.modal.ts` | 102 | `no-inferrable-types` | quitar type annotation redundante |

**Comando:**
```
npx nx lint frontend --fix
```
Luego verificar que los 5 errores desaparecieron.

---

## Tanda 2 — `@angular-eslint/prefer-inject` (71 errores)

**Errores eliminados: 71 | Warnings: 0**

Migrar todos los `constructor(private servicio: Servicio)` a `servicio = inject(Servicio)` mediante el schematic oficial de Angular:

```
npx nx g @angular/core:inject
```

Esto recorre todos los archivos del proyecto y transforma los parámetros del constructor en llamadas `inject()`. Es seguro y reversible.

**Verificación:** `npx nx lint frontend` → 71 errores de `prefer-inject` deben desaparecer.

---

## Tanda 3 — `@typescript-eslint/no-unused-vars` (8 warnings)

**Errores: 0 | Warnings eliminados: 8**

Eliminar o prefixar con `_` las variables/imports no usados.

| Archivo | Línea | Símbolo | Acción |
|---|---|---|---|
| `app.spec.ts` | 1 | `TestBed` | Eliminar import |
| `auth/guards/auth.guard.ts` | 1 | `Injectable` | Eliminar import |
| `dispensacion/guards/paso.guard.ts` | 1 | `Injectable` | Eliminar import |
| `pacientes/modals/editar-paciente.modal.ts` | 1 | `signal` | Eliminar import |
| `pacientes/services/pacientes.service.mock.ts` | 178 | `familiares` | Si no se usa, eliminar o prefixar `_` |
| `recepcion/services/recepcion.service.mock.ts` | 34, 85 | `_incluirInactivos` | Ya tiene `_`, ¿seguro es warning? Verificar |
| `recepcion/services/recepcion.service.mock.ts` | 134 | `_id` | Ya tiene `_`, verificar |
| `historial/services/historial.service.mock.ts` | 5 | `DispensacionDetalle` | Eliminar import |

---

## Tanda 4 — Tests rotos (compilation, no lint)

**Errores de compilación: 6 en 2 specs**

Los tests fallan porque no se actualizaron tras Fase 1 (username + login con 2 args).

| Archivo | Línea | Error | Fix |
|---|---|---|---|
| `administracion/services/administracion.service.spec.ts` | 23, 33 | Falta `username` en `CreateUsuarioDto` | Agregar `username: 'testuser'` |
| `auth/services/auth.service.spec.ts` | 22, 26, 34, 39 | `login()` espera 2 args | Cambiar `login('123456')` → `login('testuser', '123456')` |

**Verificación:** `npx nx test frontend` debe pasar.

---

## Tanda 5 — `@typescript-eslint/no-explicit-any` (5 warnings)

**Errores: 0 | Warnings eliminados: 5**

Reemplazar `any` con tipos concretos.

| Archivo | Línea | Contexto | Fix sugerido |
|---|---|---|---|
| `administracion/pages/gestion-usuarios.page.ts` | 179 | `event: any` en manejador | `event: CustomEvent` |
| `pacientes/pages/lista-pacientes.page.ts` | 254 | `item: any` en template | Tipar con interfaz del item (ver contexto) |
| `pacientes/pages/lista-pacientes.page.ts` | 267 | `item: any` | Ídem |
| `recepcion/pages/catalogo-medicamentos.page.ts` | 199 | `item: any` | Tipar con `Medicamento` |
| `recepcion/pages/catalogo-medicamentos.page.ts` | 211 | `item: any` | Tipar con `Medicamento` |

---

## Tanda 6 — `@angular-eslint/use-lifecycle-interface` (3 warnings)

**Errores: 0 | Warnings eliminados: 3**

Agregar la interfaz faltante a componentes que implementan `ngOnInit`.

| Archivo | Línea | Fix |
|---|---|---|
| `administracion/modals/limites-dosis.modal.ts` | 73 | Agregar `implements OnInit` |
| `pacientes/modals/paciente-qr.modal.ts` | 111 | Agregar `implements OnInit` |
| (1 más de administración, verificar) | | |

---

## Tanda 7 — Accesibilidad escaner QR (2 errores)

**Errores eliminados: 2**

| Archivo | Regla | Fix |
|---|---|---|
| `shared/components/escaner-qr.component.ts:12` | `click-events-have-key-events` | Agregar `(keydown.enter)="iniciarEscaneo()"` + `tabindex="0" role="button"` |
| `shared/components/escaner-qr.component.ts:12` | `interactive-supports-focus` | Agregar `tabindex="0"` |

```diff
- <div class="escaner-placeholder" (click)="iniciarEscaneo()">
+ <div class="escaner-placeholder" (click)="iniciarEscaneo()" (keydown.enter)="iniciarEscaneo()" tabindex="0" role="button">
```

---

## Tanda 8 — `@typescript-eslint/no-non-null-assertion` (30 warnings)

**Errores: 0 | Warnings eliminados: 30**

Reemplazar `!` con optional chaining o guards. Es la tanda más grande.

Archivos afectados (orden por cantidad de ocurrencias):

| Archivo | Ocurrencias |
|---|---|
| `pacientes/services/pacientes.service.api.ts` | **9** |
| `recepcion/services/recepcion.service.mock.ts` | **7** |
| `dispensacion/services/dispensacion.service.spec.ts` | **4** |
| `recepcion/modals/ingreso-lote.modal.ts` | **3** |
| `pacientes/modals/registro-paciente.modal.ts` | **2** |
| `administracion/services/administracion.service.spec.ts` | **2** |
| `pacientes/services/pacientes.service.mock.ts` | **1** |
| `dispensacion/services/dispensacion.service.ts` | **1** |
| `dispensacion/pages/paso3-confirmar.page.ts` | **1** |
| `inventario/services/inventario.service.mock.ts` | **1** |
| `inventario/modals/ajuste-stock.modal.ts` | **1** |
| `inventario/modals/editar-umbral.modal.ts` | **1** |
| `recepcion/modals/editar-medicamento.modal.ts` | **1** |
| `recepcion/modals/nuevo-medicamento.modal.ts` | **1** |
| `historial/services/historial.service.spec.ts` | **1** |
| `pacientes/modals/paciente-qr.modal.ts` | **1** (no, esos son otros) |

Patrón general:
```ts
// Antes:
item.propiedad!

// Después:
item.propiedad ?? fallback
// o:
if (item.propiedad !== undefined) { ... }
```

---

## Tanda 9 — Backend (2 errores + 6 warnings)

**Errores eliminados: 2 | Warnings: 6**

| Archivo | Regla | Fix |
|---|---|---|
| `backend/typeorm-data-source.ts:10,12` | `no-empty-function` | Eliminar constructor vacío y método `close()` vacío, o agregar comentario `// eslint-disable-next-line` |
| `backend/app.module.ts:64` | `no-unused-vars` (`_args`) | Ya tiene `_`, verificar si el warning persiste |
| `backend/app.module.ts:77` | `no-explicit-any` | Tipar con interfaz concreta |
| `backend/node-sqlite-compat.ts:85` | `no-unused-vars` (`_event`, `_handler`) | Ya tiene `_`, verificar |
| `backend/typeorm-data-source.ts:24` | `no-explicit-any` | Tipar con `object` o interfaz |

---

## Progreso

| Tanda | Estado | Errors antes | Errors después | Warnings antes | Warnings después |
|---|---|---|---|---|---|
| T1 — Auto-fix | 🔲 | 80 | 75 | 52 | 52 |
| T2 — prefer-inject | 🔲 | 75 | 4 | 52 | 52 |
| T3 — unused-vars | 🔲 | 4 | 4 | 52 | 44 |
| T4 — Tests rotos | 🔲 | 4 | 4 | 44 | 44 |
| T5 — no-explicit-any | 🔲 | 4 | 4 | 44 | 39 |
| T6 — use-lifecycle-interface | 🔲 | 4 | 4 | 39 | 36 |
| T7 — Accesibilidad | 🔲 | 4 | 2 | 36 | 36 |
| T8 — no-non-null-assertion | 🔲 | 2 | 2 | 36 | 6 |
| T9 — Backend | 🔲 | 2 | 0 | 6 | 0 |
| **Final** | | **0** | | **0** | |
