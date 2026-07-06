# ApoPharma — AGENTS.md

Guía de referencia para agentes opencode. Contiene comandos del proyecto, estructura, convenciones y el propósito completo del sistema.

---

## Sistema: ApoPharma

Sistema de Gestión de Farmacia de Emergencia. Monorepo Nx con Angular 21 + Ionic 8 (frontend) y NestJS 11 (backend). Digitaliza la recepción de donaciones, inventario perpetuo, dispensación guiada por escaneo QR e historial de pacientes.

### Módulos

| Módulo | Docs |
|---|---|
| Autenticación | `documents/modules/autenticacion/` |
| Recepción | `documents/modules/recepcion/` |
| Inventario | `documents/modules/inventario/` |
| Dispensación | `documents/modules/dispensacion/` |
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
- **Base de datos**: SQLite via `node:sqlite` nativo (sin `sqlite3` npm package) + TypeORM (synchronize en desarrollo)

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

## Notable

- `defaultBase` is `master` (not `main`).
- `@angular/build:unit-test` does not watch by default (`"watch": false`).
- Requiere Node.js **22+** para `node:sqlite`. El serve usa `--experimental-sqlite` automáticamente via `runtimeArgs` en `project.json`.
- `sqlite3` eliminado como dependencia; reemplazado por `node:sqlite` nativo vía `NodeSqliteCompat` wrapper.
- No CI workflows exist yet.
- Nx caching is enabled for build, lint, and test targets.
- The `.angular/`, `.nx/cache/`, and `dist/` directories are gitignored.
