# ApoPharma — AGENTS.md

Guía de referencia para agentes opencode. Contiene comandos del proyecto, estructura, convenciones y el propósito completo del sistema.

---

## Sistema: ApoPharma

Sistema de Gestión de Farmacia de Emergencia. Monorepo Nx con Angular 21 + Ionic 8 (frontend) y NestJS 11 (backend). Digitaliza la recepción de donaciones, inventario perpetuo, dispensación guiada por escaneo QR e historial de pacientes.

### Módulos

| Módulo | Docs |
|---|---|---|
| Autenticación | `documents/modules/autenticacion/` |
| Pacientes | `documents/modules/pacientes/` |
| Recepción | `documents/modules/recepcion/` |
| Recetas | `documents/modules/recetas/` |
| Dispensación | `documents/modules/dispensacion/` |
| Inventario | `documents/modules/inventario/` |
| Historial | `documents/modules/historial/` |
| Administración | `documents/modules/administracion/` |

Cada módulo contiene `proposito.md`, `diseño.md` y `tareas.md` con el desglose completo.

---

## Commands (all via `npx nx`)

| Task | Command |
|---|---|
| Serve frontend | `npx nx serve frontend` |
| Build frontend (prod) | `npx nx build frontend` |
| Build frontend (dev) | `npx nx build frontend --configuration=development` |
| Test frontend | `npx nx test frontend` |
| Lint frontend | `npx nx lint frontend` |
| E2E frontend | `npx nx e2e frontend-e2e` |
| Serve frontend (static) | `npx nx serve-static frontend` (port 4200) |
| Serve backend | `npx nx serve backend` (usa `--experimental-sqlite` automáticamente) |
| Build backend | `npx nx build backend` |
| Test backend | `npx nx test backend` |
| Lint backend | `npx nx lint backend` |
| E2E backend | `npx nx e2e backend-e2e` |

Run any command from any directory — Nx resolves the project graph automatically.

---

## Project structure

```
apps/
  frontend/          Angular 21 app (standalone, Ionic 8) — prefix: app
  frontend-e2e/      Playwright E2E tests (depends on frontend)
  backend/           NestJS 11 API (Webpack) — prefix: app
  backend-e2e/       Jest + Axios E2E tests (depends on backend)
documents/           Plan detallado del proyecto (base, frontend-plan, backend-plan, modules/*/)
.opencode/agents/    Agentes opencode especializados por módulo
```

No shared libraries exist yet — everything lives inside apps.

---

## Convenciones

### Frontend (Angular + Ionic)
- **Component selector**: `app-` prefix, kebab-case (enforced by ESLint)
- **Directive selector**: `app` prefix, camelCase (enforced by ESLint)
- **Styles**: SCSS (`inlineStyleLanguage: scss`)
- **TypeScript**: strict mode, target es2022, module `preserve` + `bundler` resolution
- **Routing**: lazy-loading por módulo funcional
- **State**: Angular signals (`signal()`, `computed()`) en servicios
- **Formularios**: ReactiveFormsModule
- **HTTP**: `HttpClient` con interceptors (auth + error)
- **Componentes Ionic**: siempre importados desde `@ionic/angular/standalone`
- **PWA**: `@angular/pwa` con service worker NetworkFirst para API

### Backend (NestJS)
- **TypeScript**: target es2021, CommonJS modules, decorator metadata enabled
- **Módulos**: uno por módulo funcional (auth, recepcion, inventario, etc.)
- **Endpoint path**: `/api/v1/...`
- **DTOs**: clases con decoradores `class-validator`
- **ORM**: TypeORM con entidades decoradas
- **Autenticación**: PIN + JWT (`@nestjs/jwt`, `@nestjs/passport`)
- **Base de datos**: SQLite via `node:sqlite` nativo (sin `sqlite3` npm package) + TypeORM (synchronize: false — NUNCA CAMBIAR A TRUE, destruye datos al recrear tablas)

### General
- **Idioma**: español en UI, inglés en código (variables, funciones, tablas DB)
- **Commits**: convencional (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Tests**: unitarios obligatorios en servicios, E2E en flujos críticos

---

## Testing

- **Frontend unit**: Vitest via `@angular/build:unit-test`. Tests co-located as `*.spec.ts`. Types via `vitest/globals`.
- **Frontend E2E**: Playwright via `@nx/playwright/plugin`. Chromium + Firefox + WebKit desktop. Base URL: `http://localhost:4200`. Dev server auto-started.
- **Backend unit**: Jest + ts-jest via `@nx/jest/plugin`. Tests co-located as `*.spec.ts`.
- **Backend E2E**: Jest + Axios (API calls against running server). Depends on `backend:build` + `backend:serve`.

---

## ESLint

ESLint v9 **flat config** (`eslint.config.mjs` at root + per project). Extends Nx + Angular flat configs. Module boundary rules enforced via `@nx/enforce-module-boundaries`.

---

## Agentes opencode

El proyecto incluye agentes especializados en `.opencode/agents/`. Úsalos anteponiendo `@nombre-agente` en tu mensaje para tareas específicas:

| Agente | Propósito |
|---|---|
| `@frontend` | Generar componentes, páginas, servicios y modales Angular + Ionic |
| `@backend` | Generar módulos NestJS, entidades, controladores, servicios y DTOs |
| `@auth` | Implementar autenticación (login, JWT, guards, roles) |
| `@recepcion` | Implementar recepción de lotes, medicamentos y etiquetado QR |
| `@inventario` | Implementar panel de stock, umbrales, conteo físico y alertas |
| `@dispensacion` | Implementar flujo de dispensación, registro de paciente y validación de dosis |
| `@historial` | Implementar consulta de historial de dispensaciones |
| `@admin` | Implementar CRUD de usuarios y configuración del sistema |

Ejemplo:
```
@recepcion Crea el modal de ingreso de lote con autocompletado de medicamentos
```

---

## Documentos clave

| Documento | Propósito |
|---|---|
| `design-system.md` | **VINCULANTE** — Guía de diseño estandar frontend. Consultar siempre antes de crear o modificar cualquier componente, página, modal o formulario. Define colores, tipografía, espaciado, patrones de modales, formularios, listas y más. |
| `documents/base.md` | Arquitectura del proyecto, stack tecnológico, esquema de base de datos |
| `documents/frontend-plan.md` | Plan de implementación del frontend: rutas, componentes, servicios, modales |
| `documents/backend-plan.md` | Plan de implementación del backend: módulos, entidades, endpoints, DTOs |
| `documents/modules/*/` | Por módulo: propósito, diseño detallado y tareas |

## ⚠️ CRÍTICO: Base de Datos SQLite — NO ELIMINAR

El archivo `apps/backend/data/farmacia.sqlite` contiene TODOS los datos reales del sistema (pacientes, recetas, dispensaciones, usuarios, medicamentos, lotes, etc.).

**REGLA ABSOLUTA: NUNCA eliminar, renombrar, mover ni borrar el archivo `farmacia.sqlite`.**  
Cualquier pérdida de este archivo implica pérdida total e irreversible de datos del sistema.

### Qué hacer cuando una columna o tabla falta en la BD

#### 1. Si `synchronize: true` (NUNCA USAR — destructivo, siempre debe estar en false)
- Solo reiniciar el servidor. TypeORM agrega automáticamente las columnas faltantes sin perder datos.
- **No hacer nada más.** Si al reiniciar no se agrega la columna, probablemente es porque `synchronize` no puede modificar una tabla existente en SQLite (limitación de SQLite). En ese caso, seguir el paso 3.

#### 2. Si `synchronize: false` (producción)
- **No tocar la BD.** Crear una migration de TypeORM que agregue la columna.
- Comando para crear migration: `npx nx run backend:typeorm migration:create ./src/app/common/migrations/NombreMigration`
- Escribir SQL manual en `up()` con `ALTER TABLE ... ADD COLUMN`, y ejecutar con el servidor.

#### 3. Solución manual directa (cuando synchronize no puede agregar la columna)
Ejecutar SQL directamente contra la BD:
```sql
ALTER TABLE nombre_tabla ADD COLUMN nombre_columna tipo DEFAULT valor_default;
```
Para SQLite los tipos comunes son: `integer`, `varchar(N)`, `boolean`, `datetime`, `float`.

**Ejemplo concreto** (lo que debió hacerse en lugar de eliminar la BD):
```sql
ALTER TABLE paciente ADD COLUMN situacion_vivienda varchar(20) DEFAULT 'no_afectado';
ALTER TABLE paciente ADD COLUMN tiene_discapacidad_motora boolean DEFAULT 0;
```

#### 4. Cómo verificar qué columnas faltan
```bash
# Mostrar schema actual de la BD
node -e "const sqlite = require('node:sqlite'); const db = new sqlite.DatabaseSync('apps/backend/data/farmacia.sqlite'); const r = db.prepare(\"SELECT sql FROM sqlite_master WHERE type='table' AND name='paciente'\").get(); console.log(r.sql); db.close();"
```

### Resolución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `no such column: p.situacion_vivienda` | Columna agregada a entidad pero no existe en BD | `ALTER TABLE paciente ADD COLUMN ...` |
| `no such column: p.tiene_discapacidad_motora` | Columna agregada a entidad pero no existe en BD | `ALTER TABLE paciente ADD COLUMN ...` |
| `ALTER TABLE fails because columns already exist` | La columna ya fue agregada | Verificar con `.schema` sqlite_master |
| Migration `up()` falla en BD fresca | La migration intenta ADD COLUMN que ya existe por `synchronize` | Usar `INSERT INTO migrations` para marcar como ejecutada, o quitar migration si ya no es necesaria |

### Flujo correcto para sincronizar schema

```
1. Verificar qué columnas faltan → node -e "SQL contra sqlite_master"
2. Ejecutar ALTER TABLE manual → preserva todos los datos
3. Reiniciar servidor
4. Verificar que el endpoint funciona
```

**NUNCA ejecutar `Remove-Item`, `rm`, `del` o cualquier comando que elimine `farmacia.sqlite`.**  
Si se necesita resetear la BD, preguntar primero al usuario y obtener confirmación explícita.

---

## Notable

- `defaultBase` is `master` (not `main`).
- `@angular/build:unit-test` does not watch by default (`"watch": false`).
- Requiere Node.js **22+** para `node:sqlite`. El serve usa `--experimental-sqlite` automáticamente via `runtimeArgs` en `project.json`.
- `sqlite3` eliminado como dependencia; reemplazado por `node:sqlite` nativo vía `NodeSqliteCompat` wrapper.
- No CI workflows exist yet.
- Nx caching is enabled for build, lint, and test targets.
- The `.angular/`, `.nx/cache/`, and `dist/` directories are gitignored.
