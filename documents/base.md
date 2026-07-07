# Base de Referencia — ApoPharma

Documento canónico de arquitectura funcional y operativa del sistema.

---

## 1. Propósito del sistema

ApoPharma es un sistema para operación de farmacia en contexto de emergencia. Su objetivo es:

- registrar pacientes y su núcleo familiar,
- formalizar recetas médicas,
- controlar la dispensación contra stock real,
- mantener trazabilidad por lote y QR,
- operar inventario con alertas y vencimientos,
- administrar usuarios y configuraciones clínicas.

El sistema trabaja bajo un flujo principal:

1. Se identifica o registra al paciente.
2. El doctor crea una receta.
3. La receta entra a una cola pendiente.
4. El farmacéutico selecciona la receta, asigna lotes y dispensa.
5. El stock se descuenta y la entrega queda en historial.

---

## 2. Roles oficiales

| Rol | Responsabilidad principal |
|---|---|---|
| `recepcionista` | Registro y mantenimiento de pacientes y núcleo familiar |
| `doctor` | Evaluación clínica, consulta de historial y creación de recetas |
| `farmaceutico` | Dispensación, validación de dosis, cola de recetas, historial e inventario operativo |
| `recepcionista_med` | Catálogo de medicamentos, lotes, QR e inventario operativo |
| `encuestador` | Censo de carpas, registro de patologías y necesidades |
| `admin` | Acceso transversal, usuarios y configuración global |

### Principios por rol

- `recepcionista` no opera medicamentos, lotes ni inventario.
- `doctor` no realiza dispensación.
- `farmaceutico` no gestiona usuarios.
- `recepcionista_med` no trabaja con pacientes ni recetas clínicas.
- `encuestador` solo accede a censo (carpas, tablero), patologías y necesidades.
- `admin` puede operar todos los módulos, pero su uso principal es supervisión y mantenimiento.

---

## 3. Módulos funcionales

| Módulo | Propósito | Roles permitidos |
|---|---|---|---|
| Autenticación | Iniciar sesión, mantener sesión, proteger acceso | todos |
| Pacientes | Buscar, registrar, editar y vincular familiares | `recepcionista`, `doctor`, `admin`, `encuestador` |
| Recepción | Crear medicamentos, registrar lotes y generar QR | `recepcionista_med`, `admin` |
| Recetas | Crear recetas y revisar antecedentes del paciente | `doctor`, `admin` |
| Dispensación | Atender cola de recetas, asignar lotes y entregar | `farmaceutico`, `admin` |
| Inventario | Ver stock, vencimientos y movimientos | `recepcionista_med`, `farmaceutico`, `admin` |
| Umbrales | Gestionar umbrales operativos por medicamento | `admin` |
| Historial | Consultar dispensaciones previas por paciente | `doctor`, `farmaceutico`, `admin` |
| Censo | Registro de carpas, familias, patologías y necesidades; tablero estadístico | `encuestador`, `recepcionista`, `admin` |
| Patologías | Catálogo de patologías (CRUD) | `admin`, `encuestador` |
| Necesidades | Catálogo de necesidades (CRUD) | `admin`, `encuestador` |
| Administración | Usuarios y configuración global | `admin` |

---

## 4. Flujo operativo oficial

### 4.1 Flujo principal

1. `recepcionista` o `doctor` identifica al paciente por QR, ID de emergencia, nombre o cédula.
2. Si no existe, se registra paciente y, si aplica, su núcleo familiar.
2.1. Al registrar paciente se captura teléfono (si está disponible) y se muestra su QR para compartirlo por WhatsApp.
3. `doctor` revisa el historial completo del paciente: recetas previas, pendientes, despachadas y medicamentos recetados anteriormente.
4. Si corresponde, crea una nueva receta seleccionando medicamentos en stock e indicando cantidad y dias.
5. La receta queda con estado `pendiente` y entra a cola de despacho.
6. `farmaceutico` entra a la cola de recetas pendientes.
7. Selecciona una receta y asigna lotes disponibles por medicamento.
8. El sistema valida stock, FEFO y dosis maxima.
9. Se confirma la dispensación.
10. Se descuenta stock, se registra movimiento y la receta pasa a `despachada`.
11. El historial del paciente queda actualizado.

### 4.2 Flujos alternos

- `recepcionista_med` puede crear medicamentos nuevos durante el registro de lotes.
- `farmaceutico` puede realizar una dispensación manual sin receta. En ese caso debe identificar al paciente y adjuntar explicitamente los medicamentos entregados.
- `doctor` debe ver disponibilidad clínica desde el propio módulo de recetas, usando una lista filtrable de medicamentos en stock, sin depender del módulo operativo de umbrales.

---

## 5. Rutas de aplicación

| Ruta | Pantalla | Módulo |
|---|---|---|---|
| `/login` | Inicio de sesión | Autenticación |
| `/recepcion` | Dashboard de recepción | Recepción |
| `/recepcion/catalogo` | Catálogo de medicamentos (CRUD + toggle inactivos) | Recepción |
| `/pacientes` | Lista y búsqueda de pacientes | Pacientes |
| `/pacientes/:id` | Detalle del paciente | Pacientes |
| `/recetas` | Flujo de receta médica | Recetas |
| `/dispensacion/cola` | Redirige a paso1 | Dispensación |
| `/dispensacion/paso1` | Cola de recetas pendientes + escaneo/búsqueda paciente | Dispensación |
| `/dispensacion/paso2` | Selección de lotes/medicamentos | Dispensación |
| `/dispensacion/paso3` | Confirmación de entrega | Dispensación |
| `/inventario` | Stock general | Inventario |
| `/inventario/umbrales` | Configuración de umbrales | Umbrales |
| `/historial` | Búsqueda de historial (QR/ID/cédula/nombre) | Historial |
| `/historial/:idEmergencia` | Historial del paciente | Historial |
| `/censo/carpas` | Lista de carpas censales | Censo |
| `/censo/crear-carpa` | Crear nueva carpa | Censo |
| `/censo/carpa/:codigo` | Detalle de carpa con integrantes | Censo |
| `/censo/tablero` | Tablero estadístico con exportación CSV | Censo |
| `/admin/usuarios` | Gestión de usuarios | Administración |
| `/admin/patologias` | Catálogo de patologías | Patologías |
| `/admin/necesidades` | Catálogo de necesidades | Necesidades |
| `/admin/configuracion` | Configuración general | Administración |

---

## 6. Esquema funcional de datos

### Entidades principales

```sql
medicamento (
  id,
  nombre_generico,
  nombre_comercial,
  presentacion,
  concentracion,
  activo,
  created_at,
  updated_at
)

lote (
  id,
  medicamento_id FK,
  codigo_qr,
  cantidad_inicial,
  cantidad_actual,
  fecha_vencimiento,
  donante,
  ubicacion,
  activo,
  created_at,
  updated_at
)

lote_movimiento (
  id,
  lote_id FK,
  tipo,
  cantidad,
  motivo,
  activo,
  created_at
)

paciente (
  id,
  id_emergencia UNIQUE,
  nombre,
  apellido,
  cedula,
  telefono,
  sexo,
  fecha_nacimiento NULL,
  edad_estimada,
  peso_estimado,
  es_damnificado,
  tiene_carga_familiar,
  es_recien_nacido DEFAULT 0,
  edad_manual NULL,
  activo,
  created_at
)

nucleo_familiar (
  id,
  titular_id FK,
  activo,
  created_at
)

nucleo_familiar_miembro (
  id,
  nucleo_familiar_id FK,
  paciente_id FK,
  relacion,
  activo,
  created_at
)

receta (
  id,
  paciente_id FK,
  doctor_id FK,
  fecha_hora,
  estado,
  activo,
  created_at
)

receta_detalle (
  id,
  receta_id FK,
  medicamento_id FK,
  cantidad_recetada,
  dias,
  dosis_indicada,
  activo,
  created_at
)

dispensacion (
  id,
  paciente_id FK,
  usuario_id FK,
  receta_id FK NULL,
  fecha_hora,
  observaciones,
  activo,
  created_at
)

dispensacion_detalle (
  id,
  dispensacion_id FK,
  lote_id FK,
  medicamento_id FK,
  cantidad,
  dosis_mg_kg,
  activo,
  created_at
)

usuario (
  id,
  nombre,
  rol,
  pin_hash,
  activo,
  created_at,
  updated_at
)

configuracion (
  id,
  medicamento_id FK,
  umbral_minimo,
  dosis_maxima_mg_kg,
  peso_referencia_kg,
  activo,
  updated_at
)

carpa (
  id,
  codigo UNIQUE,
  ubicacion,
  capacidad,
  activo,
  created_at,
  updated_at
)

carpa_paciente (
  id,
  carpa_id FK,
  paciente_id FK,
  activo,
  created_at
)

catalogo_patologia (
  id,
  nombre,
  activo,
  created_at,
  updated_at
)

catalogo_necesidad (
  id,
  nombre,
  activo,
  created_at,
  updated_at
)

paciente_patologia (
  id,
  paciente_id FK,
  patologia_id FK,
  carpa_id FK NULL,
  activo,
  created_at
)

paciente_necesidad (
  id,
  paciente_id FK,
  necesidad_id FK,
  carpa_id FK NULL,
  activo,
  created_at
)
```

### Reglas globales

- Todas las tablas funcionales usan `activo` para borrado lógico.
- `id_emergencia` es el identificador operativo del paciente en QR e historial.
- La receta es el documento clínico previo a la dispensación.
- La dispensación es el acto de entrega y puede vincularse a una receta.

---

## 7. Convenciones generales

### Frontend

- Angular standalone + Ionic.
- Guards por rol en rutas principales.
- Menú lateral filtrado por rol.
- UI en español.
- Estado con signals.
- Formularios reactivos o signals según el caso.

### Backend

- NestJS + TypeORM.
- API bajo `/api/v1`.
- JWT para autenticación.
- `@Roles()` para autorización por módulo.
- Soft delete como comportamiento por defecto.

### Operación

- El flujo principal de dispensación parte de una receta pendiente.
- La visibilidad de historial debe usar `idEmergencia`.
- Las validaciones clínicas del backend son la autoridad final en dosis y stock.

---

## 8. Decisiones funcionales vigentes

1. El módulo `Pacientes` es independiente de `Dispensación`.
2. El módulo `Recetas` es independiente y pertenece al `doctor`.
3. La cola de recetas es el punto principal de entrada para `farmaceutico`.
4. `Inventario` es un módulo operativo; cualquier consulta clínica de disponibilidad debe exponerse desde `Recetas`, no necesariamente desde la pantalla completa de inventario.
5. `Administración` es exclusivo de `admin`.
6. La gestión de umbrales es exclusiva de `admin`.
7. Los usuarios inactivos permanecen en el sistema pero no pueden acceder a la aplicación.
8. La edad del paciente se computa automáticamente desde `fechaNacimiento`; `edadManual` y `esRecienNacido` son alternativas explícitas.
9. Las carpas censales son independientes del núcleo familiar clínico.
10. El tablero estadístico se refresca en cada `ionViewWillEnter` (no hay caché entre visitas).

---

## 9. Documentos relacionados

- `documents/frontend-plan.md`
- `documents/backend-plan.md`
- `documents/modules/*/proposito.md`
- `documents/modules/*/diseño.md`
- `documents/modules/*/tareas.md`
