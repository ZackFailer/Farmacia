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
└── common/
```

---

## 3. Roles y permisos

| Rol | Áreas backend |
|---|---|
| `recepcionista` | pacientes |
| `doctor` | pacientes, recetas, historial |
| `farmaceutico` | dispensación, recetas pendientes, historial, inventario |
| `recepcionista_med` | recepción, inventario |
| `admin` | acceso total |

---

## 4. Endpoints por módulo

### Auth

| Método | Ruta | Roles |
|---|---|---|
| POST | `/api/v1/auth/login` | público |
| GET | `/api/v1/auth/me` | autenticado |

### Pacientes

| Método | Ruta | Roles |
|---|---|---|
| POST | `/api/v1/pacientes` | `recepcionista`, `doctor`, `admin` |
| GET | `/api/v1/pacientes?q=...` | `recepcionista`, `doctor`, `admin` |
| GET | `/api/v1/pacientes/emergencia/:idEmergencia` | `recepcionista`, `doctor`, `admin` |
| GET | `/api/v1/pacientes/:id` | `recepcionista`, `doctor`, `admin` |
| PATCH | `/api/v1/pacientes/:id` | `recepcionista`, `doctor`, `admin` |
| DELETE | `/api/v1/pacientes/:id` | `recepcionista`, `doctor`, `admin` |
| GET | `/api/v1/pacientes/:id/nucleo` | `recepcionista`, `doctor`, `admin` |
| POST | `/api/v1/pacientes/:id/nucleo` | `recepcionista`, `doctor`, `admin` |
| DELETE | `/api/v1/pacientes/:id/nucleo/:miembroId` | `recepcionista`, `doctor`, `admin` |

### Recepción

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/medicamentos` | `recepcionista_med`, `admin` |
| POST | `/api/v1/medicamentos` | `recepcionista_med`, `admin` |
| GET | `/api/v1/lotes` | `recepcionista_med`, `admin` |
| POST | `/api/v1/lotes` | `recepcionista_med`, `admin` |
| GET | `/api/v1/lotes/:id` | `recepcionista_med`, `admin` |
| GET | `/api/v1/lotes/:id/qr` | `recepcionista_med`, `admin` |

### Recetas

| Método | Ruta | Roles |
|---|---|---|
| POST | `/api/v1/recetas` | `doctor`, `admin` |
| GET | `/api/v1/recetas/pendientes` | `farmaceutico`, `admin` |
| GET | `/api/v1/recetas/paciente/:pacienteId` | `doctor`, `farmaceutico`, `admin` |
| GET | `/api/v1/recetas/:id` | `doctor`, `farmaceutico`, `admin` |
| PATCH | `/api/v1/recetas/:id/estado` | `farmaceutico`, `admin` |

### Dispensación

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/dispensaciones/pendientes` | `farmaceutico`, `admin` |
| GET | `/api/v1/lotes/disponibles/:medicamentoId` | `farmaceutico`, `admin` |
| GET | `/api/v1/configuraciones/:medicamentoId/dosis` | `farmaceutico`, `admin` |
| POST | `/api/v1/dispensaciones` | `farmaceutico`, `admin` |

### Inventario

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/inventario` | `recepcionista_med`, `farmaceutico`, `admin` |
| GET | `/api/v1/inventario/proximos-vencer` | `recepcionista_med`, `farmaceutico`, `admin` |
| PATCH | `/api/v1/lotes/:id/ajustar-stock` | `recepcionista_med`, `farmaceutico`, `admin` |
| GET | `/api/v1/lotes/:id/movimientos` | `recepcionista_med`, `farmaceutico`, `admin` |
| GET | `/api/v1/configuraciones/umbrales` | `admin` |
| PATCH | `/api/v1/configuraciones/:id/umbral` | `admin` |

### Historial

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/pacientes/:idEmergencia/dispensaciones` | `doctor`, `farmaceutico`, `admin` |
| GET | `/api/v1/dispensaciones/:id` | `doctor`, `farmaceutico`, `admin` |

### Administración

| Método | Ruta | Roles |
|---|---|---|
| GET | `/api/v1/usuarios` | `admin` |
| POST | `/api/v1/usuarios` | `admin` |
| PATCH | `/api/v1/usuarios/:id` | `admin` |
| DELETE | `/api/v1/usuarios/:id` | `admin` |
| GET | `/api/v1/configuraciones` | `admin` |
| PATCH | `/api/v1/configuraciones/:id` | `admin` |

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

## 8. Pendientes de alineación funcional

- Exponer disponibilidad clínica suficiente dentro del flujo de recetas.
- Mantener soportada la dispensación manual sin receta, asociada siempre a paciente.
- Revalidar en backend cualquier operación donde receta y paciente deban corresponder exactamente.
- Unificar nomenclatura de rutas de historial con `idEmergencia`.
