# Plan de Implementación — Frontend (Angular 21 + Ionic 8)

Documento de referencia para estructura, navegación y responsabilidades del frontend según el modelo funcional vigente.

---

## 1. Principios

- Aplicación basada en roles.
- Navegación principal filtrada por permisos.
- Los flujos críticos deben minimizar ambigüedad entre paciente, receta y dispensación.
- La cola de recetas es el flujo principal de farmacia.
- La interfaz debe privilegiar contexto operativo y lectura rápida.

---

## 2. Módulos del frontend

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
├── admin/           (patologías y necesidades)
├── censo/           (carpas, tablero estadístico)
├── shared/
└── core/
```

---

## 3. Rutas principales

| Ruta | Módulo | Roles |
|---|---|---|---|
| `/login` | Autenticación | todos |
| `/recepcion` | Recepción | `recepcionista_med`, `admin` |
| `/recepcion/catalogo` | Recepción — catálogo de medicamentos | `recepcionista_med`, `admin` |
| `/pacientes` | Pacientes | `recepcionista`, `doctor`, `farmaceutico`, `admin`, `encuestador` |
| `/pacientes/:id` | Pacientes | `recepcionista`, `doctor`, `farmaceutico`, `admin`, `encuestador` |
| `/recetas` | Recetas | `doctor`, `admin` |
| `/dispensacion` | Dispensación — **redirige a paso1** | `farmaceutico`, `admin` |
| `/dispensacion/cola` | Dispensación — **redirige a paso1** | `farmaceutico`, `admin` |
| `/dispensacion/paso1` | Dispensación — identificación paciente (cola + QR + búsqueda) | `farmaceutico`, `admin` |
| `/dispensacion/paso2` | Dispensación — selección de lotes | `farmaceutico`, `admin` |
| `/dispensacion/paso3` | Dispensación — confirmación de entrega | `farmaceutico`, `admin` |
| `/inventario` | Inventario | `recepcionista_med`, `farmaceutico`, `admin` |
| `/inventario/umbrales` | Umbrales | `admin` |
| `/historial` | Búsqueda de historial | `doctor`, `farmaceutico`, `admin` |
| `/historial/:idEmergencia` | Historial | `doctor`, `farmaceutico`, `admin` |
| `/censo/carpas` | Censo — lista de carpas | `encuestador`, `recepcionista`, `admin` |
| `/censo/crear-carpa` | Censo — crear carpa | `encuestador`, `admin` |
| `/censo/carpa/:codigo` | Censo — detalle de carpa | `encuestador`, `recepcionista`, `admin` |
| `/censo/tablero` | Censo — tablero estadístico | `encuestador`, `recepcionista`, `admin` |
| `/admin` | Admin — **redirige a usuarios** | `admin`, `encuestador` |
| `/admin/usuarios` | Administración | `admin` |
| `/admin/patologias` | Patologías | `admin`, `encuestador` |
| `/admin/necesidades` | Necesidades | `admin`, `encuestador` |
| `/admin/configuracion` | Administración | `admin` |

### Landing por rol

| Rol | Landing |
|---|---|---|
| `recepcionista` | `/pacientes` |
| `doctor` | `/recetas` |
| `farmaceutico` | `/dispensacion/paso1` |
| `recepcionista_med` | `/recepcion` |
| `encuestador` | `/censo/crear-carpa` |
| `admin` | `/admin/usuarios` |

---

## 4. Menú lateral esperado

| Rol | Menú visible |
|---|---|---|
| `recepcionista` | Pacientes, Censo |
| `doctor` | Pacientes, Recetas, Historial |
| `farmaceutico` | Dispensación, Inventario, Historial |
| `recepcionista_med` | Recepción, Inventario |
| `encuestador` | Censo, Patologías, Necesidades |
| `admin` | Recepción, Pacientes, Recetas, Dispensación, Inventario, Umbrales, Historial, Censo, Admin |

El menú debe mostrar además:

- nombre del usuario,
- rol visible,
- cierre de sesión.

---

## 5. Flujo por módulo

### 5.1 Autenticación

- Login por PIN.
- Guardado de token y perfil.
- Redirección por rol.
- Guards de rol y de sesión.

### 5.2 Pacientes

- búsqueda por QR o texto,
- alta rápida,
- captura de teléfono del paciente,
- visualización de QR del paciente tras registro,
- edición,
- visualización de QR desde detalle del paciente,
- núcleo familiar,
- acceso a detalle,
- salto a historial o receta según contexto.

### 5.3 Recepción

- formulario de lote,
- autocompletado de medicamento,
- creación rápida de medicamento,
- QR de lote,
- lista de ingresos recientes.

### 5.4 Recetas

- entrar al módulo de recetas después del login,
- identificar paciente por QR o búsqueda manual,
- seleccionar paciente encontrado,
- mostrar historial completo de recetas previas con estados (`pendiente`, `despachada`, `cancelada`) y medicamentos recetados,
- habilitar acción `Nueva receta`,
- mostrar lista filtrable de medicamentos en stock,
- indicar cantidad y dias,
- confirmar receta y enviarla a cola de despacho.

### 5.5 Dispensación

- entrada principal (`/dispensacion/paso1`): cola de recetas pendientes + búsqueda manual de paciente,
- la ruta `/dispensacion/cola` existe como alias y redirige a `/dispensacion/paso1`,
- en paso1 se muestran ambas opciones: seleccionar receta pendiente de la cola o identificar paciente manualmente (sin receta) para dispensación de contingencia,
- asignación de lotes,
- validación de stock y dosis,
- confirmación de entrega,
- asociación de medicamentos entregados al paciente incluso sin receta.

### 5.6 Inventario

- stock general,
- vencimientos,
- movimientos,
- ajustes.

### 5.7 Historial

- búsqueda de paciente por QR,
- búsqueda por cédula,
- búsqueda por nombre,
- consulta por `idEmergencia`,
- listado de dispensaciones,
- detalle de cada entrega.

### 5.8 Administración

- usuarios,
- roles,
- configuración global,
- límites clínicos,
- gestión de umbrales.

---

## 6. Estructura objetivo por módulo

```text
auth/
  pages/login.page.ts
  services/auth.service.ts
  services/auth.service.api.ts
  services/auth.service.mock.ts
  guards/auth.guard.ts

pacientes/
  pages/lista-pacientes.page.ts
  pages/detalle-paciente.page.ts
  modals/registro-paciente.modal.ts
  modals/editar-paciente.modal.ts
  modals/busqueda-paciente.modal.ts
  modals/agregar-familiar.modal.ts
  modals/paciente-qr.modal.ts
  services/pacientes.service.ts
  pacientes.routes.ts

recepcion/
  pages/dashboard-ingresos.page.ts
  pages/catalogo-medicamentos.page.ts
  modals/ingreso-lote.modal.ts
  modals/nuevo-medicamento.modal.ts
  modals/editar-medicamento.modal.ts
  modals/imprimir-etiqueta.modal.ts
  components/tabla-ingresos.component.ts
  services/recepcion.service.ts
  recepcion.routes.ts

recetas/
  pages/recetar.page.ts
  services/recetas.service.ts
  services/receta-draft.service.ts
  recetas.routes.ts

dispensacion/
  pages/paso1-escanear-paciente.page.ts (cola + QR + búsqueda)
  pages/paso2-seleccionar-meds.page.ts
  pages/paso3-confirmar.page.ts
  components/encabezado-paso.component.ts
  components/resumen-receta.component.ts
  modals/busqueda-medicamento.modal.ts
  modals/validacion-dosis.modal.ts
  modals/confirmacion-entrega.modal.ts
  services/dispensacion.service.ts
  dispensacion.routes.ts
  guards/paso.guard.ts

inventario/
  pages/panel-stock.page.ts
  pages/configurar-umbrales.page.ts
  modals/ajuste-stock.modal.ts
  modals/detalle-lote.modal.ts
  modals/editar-umbral.modal.ts
  components/tarjeta-medicamento.component.ts
  services/inventario.service.ts
  inventario.routes.ts

historial/
  pages/historial-busqueda.page.ts
  pages/historial-paciente.page.ts
  modals/detalle-dispensacion.modal.ts
  services/historial.service.ts
  historial.routes.ts

administracion/
  pages/gestion-usuarios.page.ts
  pages/configuracion-general.page.ts
  modals/crear-editar-usuario.modal.ts
  modals/limites-dosis.modal.ts
  services/administracion.service.ts
  administracion.routes.ts

admin/  (patologías y necesidades)
  pages/patologias.page.ts
  pages/necesidades.page.ts
  modals/crear-patologia.modal.ts
  modals/crear-necesidad.modal.ts

censo/  (carpas y tablero)
  pages/listar-carpas.page.ts
  pages/crear-carpa.page.ts
  pages/detalle-carpa.page.ts
  pages/tablero.page.ts
  modals/registrar-paciente-carpa.modal.ts
  censo.routes.ts

shared/
  components/escaner-qr.component.ts
  components/indicador-stock.component.ts
  components/buscador.component.ts
  models/*.model.ts
  enums/*.enum.ts

core/
  guards/role.guard.ts
  interceptors/auth.interceptor.ts
  interceptors/error.interceptor.ts
  services/escaner.service.ts
  services/api.constants.ts
```

---

## 7. Componentes compartidos obligatorios

| Componente | Uso |
|---|---|
| `EscanerQrComponent` | Identificación por QR de paciente o lote |
| `IndicadorStockComponent` | Semáforo de stock |
| `BuscadorComponent` | Búsqueda reusable cuando aplique |
| `EncabezadoPasoComponent` | Flujos paso a paso |

---

## 8. Criterios funcionales del frontend

1. Ningún rol debe ver rutas que backend le niega.
2. El historial debe navegar por `idEmergencia`, no por `id` interno.
3. La cola de recetas se muestra dentro de `/dispensacion/paso1` (no como página separada). Si no hay recetas pendientes, se ofrece opción de dispensación manual identificando paciente.
4. La receta es el flujo principal del `doctor`.
5. Las contingencias deben estar explícitamente marcadas en UI.
6. Las acciones destructivas deben confirmar antes de ejecutar.
7. La receta debe mostrar disponibilidad de medicamentos en stock dentro de su propio flujo.
8. La gestión de umbrales no debe mostrarse a `farmaceutico` ni `recepcionista_med`.
9. El tablero estadístico se refresca en cada `ionViewWillEnter` (sin caché entre visitas).
10. Las carpas censales son independientes del núcleo familiar clínico.

---

## 9. Despliegue (Railway)

- El frontend compilado se sirve como estático desde el backend NestJS en `http://localhost:3000` (Railway) o `https://dominio-railway.app`.
- No hay servidor separado para el frontend en producción.
- Desarrollo local: `npx nx serve frontend` (puerto 4200) con proxy al backend.
- El `baseHref` es `/` y las rutas se manejan con catch-all en Express.

---

## 10. Pendientes de alineación funcional

- SyncService offline + cola localStorage (pendiente de implementación).
- Filtro por carpa en lista-pacientes page (pendiente de implementación).
- Alinear permanencia del JWT: sin expiración por ahora; si se activa, usar 15 dias.
