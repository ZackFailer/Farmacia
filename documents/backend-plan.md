# Plan de Implementación — Backend (NestJS 11)

Documento de referencia para módulos, endpoints y permisos backend según el modelo funcional vigente.

---

## 1. Principios

- API bajo `/api/v1`.
- Autenticación por PIN + JWT.
- Autorización por rol mediante `@Roles()`.
- Soft delete por `activo` en entidades funcionales.
- La dispensación valida stock, lote, FEFO y dosis desde backend.

---

## 2. Módulos backend

```text
src/app/
├── auth/
├── pacientes/
├── recepcion/
├── recetas/
├── dispensacion/
├── inventario/
├── historial/
├── administracion/
├── patologia/
├── necesidad/
├── censo/
└── common/
```

---

## 3. Roles y permisos

| Rol | Áreas backend |
|---|---|---|
| `recepcionista` | pacientes, censo |
| `doctor` | pacientes, recetas, historial |
| `farmaceutico` | dispensación, recetas pendientes, historial, inventario, pacientes (solo consulta) |
| `recepcionista_med` | recepción, inventario |
| `encuestador` | censo, patologías, necesidades, pacientes (solo consulta) |
| `admin` | acceso total |

---

## 4. Endpoints por módulo

> **Nota**: La tabla refleja los roles reales definidos en cada controlador. Las diferencias con el plan original documentan cambios intencionales:
> - `GET /medicamentos` y `GET /lotes` incluyen roles adicionales (`doctor`, `farmaceutico`) porque estos roles necesitan ver disponibilidad de stock dentro de sus flujos sin depender del módulo de inventario completo.
> - `DELETE /pacientes/:id` es exclusivo de `admin` (hard-delete permanente). Los roles `recepcionista` y `doctor` pueden realizar soft-delete vía `PATCH /pacientes/:id` (activo=false), coherente con el principio de que acciones destructivas totales son solo de administración.

### Auth

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| POST | `/api/v1/auth/login` | público (sin JWT) | Sí |
| GET | `/api/v1/auth/me` | autenticado | Sí |

### Pacientes

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| POST | `/api/v1/pacientes` | `recepcionista`, `doctor`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/pacientes?q=...` | `recepcionista`, `doctor`, `farmaceutico`, `admin` | Sí — soporta `?incluirInactivos=true` |
| GET | `/api/v1/pacientes/emergencia/:idEmergencia` | `recepcionista`, `doctor`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/pacientes/:id` | `recepcionista`, `doctor`, `farmaceutico`, `admin` | Sí |
| PATCH | `/api/v1/pacientes/:id` | `recepcionista`, `doctor`, `admin` | Sí — soft-delete y edición |
| DELETE | `/api/v1/pacientes/:id` | `admin` | Sí — hard-delete permanente, solo admin |
| GET | `/api/v1/pacientes/:id/nucleo` | `recepcionista`, `doctor`, `admin` | Sí |
| POST | `/api/v1/pacientes/:id/nucleo` | `recepcionista`, `doctor`, `admin` | Sí |
| DELETE | `/api/v1/pacientes/:id/nucleo/:miembroId` | `recepcionista`, `doctor`, `admin` | Sí |

### Recepción

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/medicamentos` | `recepcionista_med`, `doctor`, `farmaceutico`, `admin` | Sí — doctor/farmaceutico necesitan ver stock en sus flujos |
| POST | `/api/v1/medicamentos` | `recepcionista_med`, `admin` | Sí |
| PATCH | `/api/v1/medicamentos/:id` | `recepcionista_med`, `admin` | Sí — editar medicamento |
| DELETE | `/api/v1/medicamentos/:id` | `admin` | Sí — hard-delete |
| GET | `/api/v1/lotes` | `recepcionista_med`, `farmaceutico`, `admin` | Sí — farmaceutico necesita ver lotes para dispensación |
| POST | `/api/v1/lotes` | `recepcionista_med`, `admin` | Sí |
| PATCH | `/api/v1/lotes/:id` | `recepcionista_med`, `admin` | Sí — editar lote |
| DELETE | `/api/v1/lotes/:id` | `admin` | Sí — hard-delete |
| GET | `/api/v1/lotes/:id` | `recepcionista_med`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/lotes/qr/:codigo` | `recepcionista_med`, `farmaceutico`, `admin` | Sí — búsqueda por QR |
| GET | `/api/v1/lotes/:id/qr` | `recepcionista_med`, `farmaceutico`, `admin` | Sí — generar QR de lote |

### Recetas

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| POST | `/api/v1/recetas` | `doctor`, `admin` | Sí |
| GET | `/api/v1/recetas/pendientes` | `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/recetas/paciente/:pacienteId` | `doctor`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/recetas/:id` | `doctor`, `farmaceutico`, `admin` | Sí |
| PATCH | `/api/v1/recetas/:id/estado` | `farmaceutico`, `admin` | Sí |

### Dispensación

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/dispensaciones/pendientes` | `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/lotes/disponibles/:medicamentoId` | `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/configuraciones/:medicamentoId/dosis` | `farmaceutico`, `admin` | Sí |
| POST | `/api/v1/dispensaciones` | `farmaceutico`, `admin` | Sí |

### Inventario

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/inventario` | `recepcionista_med`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/inventario/proximos-vencer` | `recepcionista_med`, `farmaceutico`, `admin` | No — definido en servicio pero sin consumidor frontend |
| PATCH | `/api/v1/lotes/:id/ajustar-stock` | `recepcionista_med`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/lotes/:id/movimientos` | `recepcionista_med`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/configuraciones/umbrales` | `admin` | Sí |
| PATCH | `/api/v1/configuraciones/:id/umbral` | `admin` | Sí |

### Historial

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/pacientes/:idEmergencia/dispensaciones` | `doctor`, `farmaceutico`, `admin` | Sí |
| GET | `/api/v1/dispensaciones/:id` | `doctor`, `farmaceutico`, `admin` | No — definido en controlador pero sin consumidor frontend |

### Administración

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/usuarios` | `admin` | Sí — soporta `?incluirInactivos=true` |
| POST | `/api/v1/usuarios` | `admin` | Sí |
| PATCH | `/api/v1/usuarios/:id` | `admin` | Sí |
| DELETE | `/api/v1/usuarios/:id` | `admin` | Sí — hard-delete |
| GET | `/api/v1/configuraciones` | `admin` | Sí |
| PATCH | `/api/v1/configuraciones/:id` | `admin` | Sí |

### Censo

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/censo/estadisticas` | `encuestador`, `recepcionista`, `admin` | Sí |
| POST | `/api/v1/censo/carpas` | `encuestador`, `admin` | Sí |
| GET | `/api/v1/censo/carpas` | `encuestador`, `recepcionista`, `admin` | Sí |
| GET | `/api/v1/censo/carpas/:codigo` | `encuestador`, `recepcionista`, `admin` | Sí |
| PATCH | `/api/v1/censo/carpas/:codigo` | `encuestador`, `admin` | Sí |
| DELETE | `/api/v1/censo/carpas/:codigo` | `admin` | Sí — hard-delete |
| POST | `/api/v1/censo/carpas/:codigo/miembros` | `encuestador`, `admin` | Sí |

### Patologías

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/patologias` | `encuestador`, `admin` | Sí |
| GET | `/api/v1/patologias/:id` | `encuestador`, `admin` | Sí |
| POST | `/api/v1/patologias` | `encuestador`, `admin` | Sí |
| PATCH | `/api/v1/patologias/:id` | `encuestador`, `admin` | Sí |
| DELETE | `/api/v1/patologias/:id` | `admin` | Sí — hard-delete |

### Necesidades

| Método | Ruta | Roles | En uso |
|---|---|---|---|
| GET | `/api/v1/necesidades` | `encuestador`, `admin` | Sí |
| GET | `/api/v1/necesidades/:id` | `encuestador`, `admin` | Sí |
| POST | `/api/v1/necesidades` | `encuestador`, `admin` | Sí |
| PATCH | `/api/v1/necesidades/:id` | `encuestador`, `admin` | Sí |
| DELETE | `/api/v1/necesidades/:id` | `admin` | Sí — hard-delete |

---

## 5. Estructura de entidades

### Entidades de catálogo y stock

- `Medicamento`
- `Lote`
- `LoteMovimiento`
- `Configuracion`

### Entidades clínicas y operativas

- `Paciente`
- `NucleoFamiliar`
- `NucleoFamiliarMiembro`
- `Receta`
- `RecetaDetalle`
- `Dispensacion`
- `DispensacionDetalle`

### Entidades de censo

- `Carpa`
- `CarpaPaciente`
- `CatalogoPatologia`
- `CatalogoNecesidad`
- `PacientePatologia`
- `PacienteNecesidad`

### Entidades de seguridad

- `Usuario`

---

## 6. Reglas backend clave

### Pacientes

- El identificador operativo es `idEmergencia`.
- Debe persistirse `telefono` como dato de contacto opcional del paciente.
- El borrado funcional es lógico (`activo = false`).
- El historial familiar se modela por núcleo y miembros.

### Recetas

- Una receta siempre pertenece a un paciente y a un doctor.
- Estados válidos: `pendiente`, `despachada`, `cancelada`.
- El doctor entra al módulo de recetas, identifica paciente, revisa historial completo y luego puede crear una nueva receta.
- La receta representa medicamentos en stock, cantidad y dias indicados.
- El flujo principal es crear receta y dejarla pendiente para farmacia.

### Dispensación

- Puede vincularse a `recetaId`.
- Si hay receta, debe actualizarse a `despachada` al completar la entrega.
- La selección de lotes debe respetar FEFO.
- La validación de dosis se hace en backend.
- El descuento de stock y el movimiento de lote deben quedar registrados en la misma operación lógica.
- La dispensación manual sin receta sigue existiendo y debe vincular siempre paciente + medicamentos entregados.

### Inventario

- Ajustes de stock deben registrar motivo y trazabilidad.
- Umbrales son configuración administrativa por medicamento.

### Administración

- Usuarios activos/inactivos; un usuario inactivo permanece en base de datos pero no puede autenticarse.
- El último administrador no debe quedar eliminado o inutilizado por accidente.
- Configuraciones globales y clínicas se mantienen aquí.

### Censo

- Las carpas censales son independientes del núcleo familiar clínico (`NucleoFamiliar`).
- Una carpa tiene múltiples pacientes (relación `CarpaPaciente`).
- Los pacientes en carpa pueden tener patologías y necesidades del catálogo.
- El tablero estadístico calcula totales de pacientes, carpas, menores de edad, patologías y necesidades.
- Admin elimina carpas permanentemente; encuestador solo puede editar.

### Patologías y Necesidades

- Catálogos independientes (CRUD completo).
- `encuestador` puede crear, editar y ver; solo `admin` puede eliminar.
- Se vinculan a pacientes dentro de carpas (`PacientePatologia`, `PacienteNecesidad`).

---

## 7. Autenticación y autorización

### Flujo

1. Usuario envía PIN.
2. Backend valida usuario activo.
3. Se emite JWT con `sub`, `nombre` y `rol`.
4. `JwtAuthGuard` protege las rutas.
5. `RolesGuard` aplica permisos de negocio.

### Política de sesión

- No existe expiración operativa obligatoria del JWT por ahora.
- Si se activa expiración, la duración objetivo será de 15 dias.

### Payload esperado

```json
{
  "sub": 1,
  "nombre": "Usuario",
  "rol": "doctor",
  "iat": 1234567890
}
```

---

## 8. Base de datos

- PostgreSQL 16 en producción (Railway) y desarrollo local.
- `synchronize: false` — migraciones explícitas con TypeORM.
- Migración inicial: `apps/backend/src/app/common/migrations/1741200000000-CreatePostgresSchema.ts`.
- Conexión vía `DATABASE_URL` (Railway) o variables individuales (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`).
- En Railway, el servicio PostgreSQL asigna `DATABASE_URL` automáticamente al servicio Web.
- Seed data: medicamentos, patologías, necesidades, usuarios y configuraciones se cargan manualmente desde la consola SQL de Railway o mediante `scripts/exportar-seed.js`.

## 9. Despliegue

- Railway: dos servicios (Web + PostgreSQL).
- Build: `railway.json` define `buildCommand` y `startCommand`.
- El frontend compilado se sirve como estático desde el backend NestJS (sin servidor separado).

---

## 8. Pendientes de alineación funcional

- Exponer disponibilidad clínica suficiente dentro del flujo de recetas.
- Mantener soportada la dispensación manual sin receta, asociada siempre a paciente.
- Revalidar en backend cualquier operación donde receta y paciente deban corresponder exactamente.
- Unificar nomenclatura de rutas de historial con `idEmergencia`.
- Implementar filtro por carpa en búsqueda de pacientes (endpoint `GET /pacientes?carpaCodigo=...`).
