# Base de Referencia — ApoPharma

Documento raíz de arquitectura y convenciones del Sistema de Gestión de Farmacia de Emergencia.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Monorepo | Nx | 23 |
| Frontend | Angular (standalone) + Ionic 8 | 21 |
| Backend | NestJS | 11 |
| Lenguaje | TypeScript (strict) | ~5.9 |
| Estilos | SCSS | — |
| Test unitarios (FE) | Vitest | 4 |
| Test unitarios (BE) | Jest + ts-jest | 30 |
| E2E (FE) | Playwright | — |
| E2E (BE) | Jest + Axios | — |
| Linter | ESLint v9 (flat config) | — |
| Formateo | Prettier | singleQuote, 2 spaces |

---

## Estructura del Proyecto

```
Farmacia/
├── apps/
│   ├── frontend/          Angular 21 + Ionic 8 (standalone)
│   │   └── src/app/
│   │       ├── auth/          Módulo de autenticación
│   │       ├── recepcion/     Módulo de recepción
│   │       ├── inventario/    Módulo de inventario
│   │       ├── dispensacion/  Módulo de dispensación
│   │       ├── historial/     Módulo de historial
│   │       ├── administracion/ Módulo de administración
│   │       ├── shared/        Componentes, pipes, directivas compartidas
│   │       └── core/          Servicios singleton, guards, interceptors
│   ├── backend/           NestJS 11
│   │   └── src/app/
│   │       ├── auth/          Módulo de autenticación
│   │       ├── recepcion/     Módulo de recepción
│   │       ├── inventario/    Módulo de inventario
│   │       ├── dispensacion/  Módulo de dispensación
│   │       ├── historial/     Módulo de historial
│   │       ├── administracion/ Módulo de administración
│   │       └── common/        Guards, decoradores, filtros compartidos
│   ├── frontend-e2e/
│   └── backend-e2e/
└── documents/             Documentación del proyecto
```

---

## Base de Datos — Esquema Relacional (7 tablas)

```sql
-- 1. medicamento
medicamento (id, nombre_generico, nombre_comercial, presentacion, concentracion, created_at, updated_at)

-- 2. lote
lote (id, medicamento_id FK, codigo_qr, cantidad_inicial, cantidad_actual,
      fecha_vencimiento, donante, ubicacion, created_at, updated_at)

-- 3. paciente
paciente (id, id_emergencia UNIQUE, sexo, edad_estimada, peso_estimado,
          es_damnificado BOOLEAN, created_at)

-- 4. dispensacion
dispensacion (id, paciente_id FK, usuario_id FK, fecha_hora, observaciones)

-- 5. dispensacion_detalle
dispensacion_detalle (id, dispensacion_id FK, lote_id FK, medicamento_id FK,
                      cantidad, dosis_mg_kg, created_at)

-- 6. usuario
usuario (id, nombre, rol ENUM('farmaceutico','despachador'), pin_hash, created_at, updated_at)

-- 7. configuracion
configuracion (id, medicamento_id FK, umbral_minimo INT,
               dosis_maxima_mg_kg DECIMAL, peso_referencia_kg DECIMAL,
               updated_at)
```

---

## Convenciones

### Frontend
- **Selector componente**: `app-` prefijo, kebab-case
- **Selector directiva**: `app` prefijo, camelCase
- **Estilos**: SCSS (global en `styles.scss`, encapsulado por componente)
- **Rutas**: lazy-loading por módulo funcional
- **Estado**: servicios con `BehaviorSubject` o señales de Angular

### Backend
- **Módulos NestJS**: uno por módulo funcional
- **Endpoint path**: versionado (`/api/v1/...`)
- **DTOs**: clases con decoradores `class-validator`
- **ORM**: TypeORM con entidades decoradas
- **Autenticación**: PIN + JWT

### General
- **Idioma**: español en UI, inglés en código (variables, funciones, tablas DB)
- **Commits**: convencional (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Tests**: unitarios obligatorios en servicios, E2E en flujos críticos

---

## API — Diseño General

```
Base URL: /api/v1

Autenticación: POST /auth/login -> JWT token

Protección: Guards JWT en todas las rutas excepto /auth/login

Recursos:
  /medicamentos          CRUD completo
  /lotes                 CRUD + ajuste stock
  /pacientes             CRUD
  /dispensaciones        Create + Read (historial)
  /usuarios              CRUD (solo admin)
  /configuraciones       CRUD (solo admin)
```

---

## Flujo de Datos (Frontend → Backend)

```
[Ionic Component] --> [Service (HttpClient)] --> [NestJS Controller]
                                                       |
                                                  [Service Layer]
                                                       |
                                                  [TypeORM Repository]
                                                       |
                                                   [SQLite/Postgres]
```

Respuesta estándar API:
```json
// Éxito
{ "data": ..., "message": "ok" }

// Error
{ "error": "...", "statusCode": 400 }
```

---

## Pantallas y Rutas (Frontend)

| Ruta | Pantalla | Módulo |
|---|---|---|
| `/login` | Inicio de Sesión | Autenticación |
| `/recepcion` | Dashboard de Ingresos | Recepción |
| `/inventario` | Panel de Stock General | Inventario |
| `/inventario/umbrales` | Configuración de Umbrales | Inventario |
| `/dispensacion/paso1` | Escanear Paciente | Dispensación |
| `/dispensacion/paso2` | Seleccionar Medicamentos | Dispensación |
| `/dispensacion/paso3` | Escaneo de Lote y Confirmación | Dispensación |
| `/historial/:pacienteId` | Historial de Paciente | Historial |
| `/admin/usuarios` | Gestión de Usuarios | Administración |
| `/admin/configuracion` | Configuración General | Administración |

---

## Modales Transversales

| Modal | Disparado desde | Propósito |
|---|---|---|
| Registro Rápido de Lote | Recepción | Ingresar nuevo lote + QR |
| Nuevo Medicamento (anidado) | Recepción | Crear medicamento al vuelo |
| Impresión de Etiqueta | Recepción | Imprimir QR del lote |
| Ajuste Rápido (Conteo Físico) | Inventario | Corregir stock |
| Detalle de Lote | Inventario | Ver movimientos del lote |
| Alerta de Stock | Inventario | Notificación umbral bajo |
| Edición de Umbral | Inventario | Configurar umbral mínimo |
| Registro Rápido de Paciente | Dispensación | Crear paciente al vuelo |
| Búsqueda Manual de Paciente | Dispensación | Buscar paciente sin QR |
| Búsqueda de Medicamento | Dispensación | Agregar medicamento a receta |
| Validación de Dosis | Dispensación | Alerta de dosis máxima |
| Confirmación de Entrega | Dispensación | Confirmar dispensación |
| Detalle de Dispensación | Historial | Ver detalle de entrega |
| Creación/Edición de Usuario | Administración | CRUD de usuarios |
| Configuración de Límites de Dosis | Administración | Definir dosis máximas |
