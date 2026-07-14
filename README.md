# ApoPharma — Sistema de Gestión de Farmacia de Emergencia

Monorepo para digitalizar la gestión de insumos y la dispensación de medicamentos en una farmacia de campaña. Reemplaza el registro en papel por un flujo ágil basado en QR, mantiene trazabilidad de lotes y dispensaciones, y permite un control mínimo pero seguro sobre la entrega de fármacos a los pacientes.

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 21 (standalone) + Ionic 8 |
| **Backend** | NestJS 11 + TypeORM |
| **Base de datos** | PostgreSQL 16 (Railway) / PostgreSQL local |
| **Lenguaje** | TypeScript ~5.9 (strict) |
| **Monorepo** | Nx 23 |
| **Estilos** | SCSS |
| **Test unitarios (FE)** | Vitest |
| **Test unitarios (BE)** | Jest + ts-jest |
| **E2E (FE)** | Playwright |
| **E2E (BE)** | Jest + Axios |
| **Linter** | ESLint v9 (flat config) |

## Propósito

El sistema está diseñado para **equipos humanitarios** que operan farmacias de emergencia en terreno. Su objetivo es:

1. **Registrar pacientes y núcleo familiar** — identificación por QR, ID de emergencia, cédula o nombre.
2. **Formalizar recetas médicas** — el doctor crea recetas con medicamentos en stock.
3. **Controlar la dispensación** — contra stock real, con validación de dosis y asignación de lotes.
4. **Mantener trazabilidad** — por lote y QR, con historial completo por paciente.
5. **Operar inventario** — con alertas de vencimiento, umbrales y movimientos.
6. **Administrar el sistema** — usuarios, roles, patologías, necesidades y configuración global.
7. **Censo de damnificados** — registro de carpas, familias, patologías y necesidades; tablero estadístico exportable a Excel.
8. **Estadísticas de medicamentos** — métricas de uso, top medicamentos, distribución por sexo/edad.

## Alcance

### Incluye
- Registro y edición de pacientes con núcleo familiar
- Creación de recetas médicas por doctor con visibilidad de stock
- Dispensación contra receta (paso 1: escanear paciente, paso 2: seleccionar medicamentos y lotes, paso 3: confirmar)
- Dispensación manual sin receta para casos especiales
- Historial completo de recetas y dispensaciones por paciente
- Catálogo de medicamentos con toggle de inactivos
- Gestión de usuarios con PIN y roles
- Configuración de hora de cierre del día (admin)
- Censo: carpas, patologías, necesidades, tablero estadístico + exportación Excel
- Estadísticas de medicamentos: top 10, distribución sexo/edad, medicamentos sin uso + exportación Excel

### Fuera de alcance
- Valor monetario de donaciones o gestión contable
- Expediente médico completo, diagnóstico o prescripción electrónica
- Detección de interacciones medicamentosas complejas
- Órdenes de compra automáticas
- Proyecciones de consumo avanzadas

## Arquitectura

```
Farmacia/
├── apps/
│   ├── frontend/                    Angular 21 + Ionic 8 (standalone)
│   │   └── src/app/
│   │       ├── auth/                Inicio de sesión
│   │       ├── recepcion/           Catálogo de medicamentos (CRUD)
│   │       ├── pacientes/           Lista y detalle de pacientes
│   │       ├── recetas/             Creación de recetas médicas
│   │       ├── dispensacion/        Flujo de 3 pasos (escanear → seleccionar → confirmar)
│   │       ├── historial/           Historial de paciente
│   │       ├── medicamentos/        Estadísticas de medicamentos
│   │       ├── censo/               Carpas, tablero estadístico, exportación
│   │       ├── administracion/      Usuarios, configuración global
│   │       ├── admin/               Patologías y necesidades (CRUD)
│   │       ├── shared/              Componentes, pipes y modelos compartidos
│   │       └── core/                Interceptors, guards y servicios singleton
│   │
│   ├── backend/                     NestJS 11
│   │   └── src/app/
│   │       ├── auth/                Login + JWT
│   │       ├── recepcion/           CRUD medicamentos
│   │       ├── pacientes/           CRUD pacientes + núcleo familiar
│   │       ├── recetas/             Recetas médicas
│   │       ├── dispensacion/        Dispensación, validación dosis
│   │       ├── historial/           Consulta de dispensaciones
│   │       ├── censo/               Carpas, estadísticas, exportación
│   │       ├── estadisticas-medicamentos/  Métricas de uso de medicamentos
│   │       ├── administracion/      CRUD usuarios + parámetros del sistema
│   │       ├── patologia/           CRUD patologías
│   │       ├── necesidad/           CRUD necesidades
│   │       └── common/              Entidades, guards, decoradores, migraciones
│   │
│   ├── frontend-e2e/               Playwright
│   └── backend-e2e/                Jest + Axios
│
├── documents/                       Planes detallados por módulo
│   ├── base.md                      Referencia general de arquitectura
│   ├── frontend-plan.md             Plan de implementación frontend
│   ├── backend-plan.md              Plan de implementación backend
│   └── modules/                     Propósito, diseño y tareas por módulo
│
├── .opencode/                       Agentes opencode para el proyecto
│   └── agents/                      Definiciones de agentes especializados
│
├── scripts/                         Scripts de utilidad (PM2, seed)
├── nx.json
├── eslint.config.mjs
├── tsconfig.base.json
└── package.json
```

## Configuración Local (.env)

Crea un archivo `.env` en la raíz del proyecto con la configuración de tu base de datos local:

```env
# PostgreSQL local (variables individuales)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=farmacia_dev

# O bien, usa DATABASE_URL (sobrescribe las individuales)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/farmacia_dev

# JWT
JWT_SECRET=mi-secreto-local

# SSL (deshabilitado en local)
DB_SSL=false
```

> **Nota**: La contraseña por defecto es `postgres`. Si tu instalación local de PostgreSQL 18 usa otra contraseña, actualiza `DB_PASSWORD` en el `.env`.

## Base de Datos

**Producción (Railway)**: PostgreSQL 16. La migración inicial crea todas las tablas al iniciar.

**Desarrollo local**: PostgreSQL vía TypeORM + `pg`. Usa `DATABASE_URL` o las variables individuales del `.env`.

### Migraciones

Todas las migraciones TypeORM están en `apps/backend/src/app/common/migrations/` y se ejecutan automáticamente al iniciar (`migrationsRun: true`).

| Migración | Descripción |
|---|---|
| `1741200000000-CreatePostgresSchema` | Schema inicial (16 tablas) |
| `1741708800000-AddSuplidaToPacienteNecesidad` | Agrega columna `suplida` a `paciente_necesidad` |
| `1741900000000-EliminarLotesYAgregarTrazabilidad` | Elimina tablas `lote` y `lote_movimiento`; agrega trazabilidad directa a dispensaciones |
| `1741900000001-SimplificarSinLotes` | Simplifica entidades tras eliminar lotes |
| `1742000000002-DropCantidadFromMedicamento` | Elimina columna `cantidad` de `medicamento` |
| `1742100000003-CreateParametroSistema` | Crea tabla `parametro_sistema` para configuraciones del sistema (hora de cierre, etc.) |

### Tablas vigentes

| Tabla | Propósito |
|---|---|
| `usuario` | Usuarios del sistema con PIN y rol |
| `medicamento` | Catálogo de medicamentos |
| `paciente` | Registro mínimo de pacientes de emergencia |
| `nucleo_familiar` | Grupo familiar asociado a un titular |
| `nucleo_familiar_miembro` | Miembros del núcleo familiar con relación |
| `receta` | Cabecera de receta médica |
| `receta_detalle` | Items de cada receta |
| `dispensacion` | Cabecera de cada entrega |
| `dispensacion_detalle` | Items de cada dispensación |
| `configuracion` | Umbrales de stock y límites de dosis por medicamento |
| `catalogo_patologia` | Catálogo de patologías |
| `catalogo_necesidad` | Catálogo de necesidades |
| `paciente_patologia` | Patologías por paciente (con tratamiento) |
| `paciente_necesidad` | Necesidades por paciente (con trazabilidad de cumplimiento) |
| `carpa` | Carpas censales |
| `carpa_paciente` | Pacientes asignados a carpas |
| `parametro_sistema` | Configuraciones clave/valor del sistema (hora de cierre, etc.) |

### Seed data

Las tablas `medicamento`, `catalogo_patologia`, `catalogo_necesidad`, `usuario` y `configuracion` deben poblarse manualmente desde la consola SQL de Railway con las queries generadas por `scripts/exportar-seed.js`.

## Módulos Funcionales

| Módulo | Rutas principales | Roles |
|---|---|---|
| **Autenticación** | `/login` | Todos |
| **Pacientes** | `/pacientes`, `/pacientes/:id` | recepcionista, doctor, farmaceutico, admin, encuestador |
| **Recepción (Catálogo)** | `/recepcion`, `/recepcion/catalogo` | recepcionista_med, admin |
| **Recetas** | `/recetas` | doctor, admin |
| **Dispensación** | `/dispensacion/paso1`, `/dispensacion/paso2`, `/dispensacion/paso3` | farmaceutico, admin |
| **Historial** | `/historial`, `/historial/:idEmergencia` | doctor, farmaceutico, admin |
| **Inventario (Estadísticas)** | `/medicamentos/estadisticas` | farmaceutico, recepcionista_med, doctor, admin |
| **Censo** | `/censo/carpas`, `/censo/crear-carpa`, `/censo/carpa/:codigo`, `/censo/tablero` | encuestador, recepcionista, admin |
| **Administración** | `/admin/usuarios`, `/admin/configuracion`, `/admin/patologias`, `/admin/necesidades` | admin (patologías/necesidades: también encuestador) |

## Comandos

### Desarrollo

```sh
# Frontend
npx nx serve frontend                      # http://localhost:4200
npx nx build frontend                      # Producción
npx nx build frontend --configuration=development
npx nx test frontend
npx nx lint frontend
npx nx e2e frontend-e2e

# Backend
npx nx serve backend                       # http://localhost:3000
npx nx build backend
npx nx test backend
npx nx lint backend
npx nx e2e backend-e2e

# Ambos simultáneamente
npx nx run-many -t serve -p frontend backend
```

### Producción (PM2)

El servidor se sirve completo desde un solo proceso NestJS en el puerto 3000 (frontend compilado sirviendo como estático).

```sh
# Iniciar
pm2 start ecosystem.config.js

# Verificar estado
pm2 status

# Ver logs
pm2 logs apopharma-backend

# Detener
pm2 stop apopharma-backend

# Reiniciar (ej: después de actualizar código)
pm2 restart apopharma-backend
```

### Inicio automático al encender la PC

Ejecutar **una vez como Administrador**:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\farmacia\Farmacia-master\Farmacia-master\scripts\register-pm2-startup.ps1"
```

### Actualizar después de cambios

```sh
npx nx build backend
npx nx build frontend
pm2 restart apopharma-backend
```

## Railway (producción)

La app está desplegada en Railway con dos servicios:

| Servicio | Descripción |
|---|---|
| **Web** | Backend NestJS que sirve el frontend compilado (puerto 3000) |
| **PostgreSQL** | Base de datos PostgreSQL 16 |

### Variables de entorno (Railway)

| Variable | Propósito |
|---|---|
| `DATABASE_URL` | Connection string completa (asignada automáticamente por Railway) |
| `DB_SSL=true` | Habilita SSL para PostgreSQL |
| `JWT_SECRET` | Secreto para firmar JWT |
| `DISABLE_HTTPS=true` | Desactiva HTTPS en Railway (el proxy maneja TLS) |

### Despliegue

Railway detecta `railway.json` y construye automáticamente:

```sh
# Build: backend (Webpack) + frontend (Angular)
# Postbuild: copia start.js, instala dependencias de producción
# Start: node dist/apps/backend/start.js
```

## Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| `QueryFailedError: null value in paciente_id` | TypeORM cascade en `save()` trunca relaciones | Usar `update()` en vez de `findOne + save()` para evitar cascade |
| `column m.presentacion must appear in GROUP BY` | PostgreSQL estricto en GROUP BY | Agregar todas las columnas seleccionadas al GROUP BY |
| `Http failure during parsing for /api/v1/...` | API URL hardcodeada en lugar de `API_BASE_URL` | Usar `API_BASE_URL` desde `api.constants.ts` (resuelve a localhost:3000 en dev) |
| `Nest can't resolve dependencies of XxxService` | Entidad faltante en `TypeOrmModule.forFeature` | Agregar la entidad al array del módulo correspondiente |
| `DataTypeNotSupportedError` en Railway | Entidad usa `type: 'datetime'` | Cambiar a `type: 'timestamp'` |
| `ECONNREFUSED` al conectar DB | PostgreSQL no está corriendo | Verificar servicio Railway o PostgreSQL local |
| `EADDRINUSE` al iniciar | Puerto 3000 ocupado | Detener proceso anterior o cambiar puerto |

Ver `AGENTS.md` para la lista completa de comandos y el uso de los agentes opencode.
