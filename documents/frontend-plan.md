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
├── shared/
└── core/
```

---

## 3. Rutas principales

| Ruta | Módulo | Roles |
|---|---|---|
| `/login` | Autenticación | todos |
| `/recepcion` | Recepción | `recepcionista_med`, `admin` |
| `/pacientes` | Pacientes | `recepcionista`, `doctor`, `admin` |
| `/pacientes/:id` | Pacientes | `recepcionista`, `doctor`, `admin` |
| `/recetas` | Recetas | `doctor`, `admin` |
| `/dispensacion/cola` | Dispensación | `farmaceutico`, `admin` |
| `/dispensacion/paso1` | Dispensación manual/contingencia | `farmaceutico`, `admin` |
| `/dispensacion/paso2` | Dispensación | `farmaceutico`, `admin` |
| `/dispensacion/paso3` | Dispensación | `farmaceutico`, `admin` |
| `/inventario` | Inventario | `recepcionista_med`, `farmaceutico`, `admin` |
| `/inventario/umbrales` | Umbrales | `admin` |
| `/historial` | Búsqueda de historial | `doctor`, `farmaceutico`, `admin` |
| `/historial/:idEmergencia` | Historial | `doctor`, `farmaceutico`, `admin` |
| `/admin/usuarios` | Administración | `admin` |
| `/admin/configuracion` | Administración | `admin` |

### Landing por rol

| Rol | Landing |
|---|---|
| `recepcionista` | `/pacientes` |
| `doctor` | `/recetas` |
| `farmaceutico` | `/dispensacion/cola` |
| `recepcionista_med` | `/recepcion` |
| `admin` | `/admin/usuarios` |

---

## 4. Menú lateral esperado

| Rol | Menú visible |
|---|---|
| `recepcionista` | Pacientes |
| `doctor` | Pacientes, Recetas, Historial |
| `farmaceutico` | Dispensación, Inventario, Historial |
| `recepcionista_med` | Recepción, Inventario |
| `admin` | Recepción, Pacientes, Recetas, Dispensación, Inventario, Umbrales, Historial, Admin |

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

- entrada principal: cola de recetas pendientes,
- flujo alterno: dispensación manual con paciente identificado,
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
  guards/

pacientes/
  pages/lista-pacientes.page.ts
  pages/detalle-paciente.page.ts
  modals/
  services/pacientes.service.ts
  pacientes.routes.ts

recepcion/
  pages/dashboard-ingresos.page.ts
  modals/
  services/recepcion.service.ts
  recepcion.routes.ts

recetas/
  pages/recetar.page.ts
  services/recetas.service.ts
  recetas.routes.ts

dispensacion/
  pages/paso0-cola.page.ts
  pages/paso1-escanear-paciente.page.ts
  pages/paso2-seleccionar-meds.page.ts
  pages/paso3-confirmar.page.ts
  components/
  modals/
  services/dispensacion.service.ts
  dispensacion.routes.ts

inventario/
  pages/panel-stock.page.ts
  pages/configurar-umbrales.page.ts
  modals/
  services/inventario.service.ts
  inventario.routes.ts

historial/
  pages/historial-busqueda.page.ts
  pages/historial-paciente.page.ts
  modals/
  services/historial.service.ts
  historial.routes.ts

administracion/
  pages/gestion-usuarios.page.ts
  pages/configuracion-general.page.ts
  modals/
  services/administracion.service.ts
  administracion.routes.ts
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
3. La cola de recetas es la entrada por defecto de `farmaceutico`.
4. La receta es el flujo principal del `doctor`.
5. Las contingencias deben estar explícitamente marcadas en UI.
6. Las acciones destructivas deben confirmar antes de ejecutar.
7. La receta debe mostrar disponibilidad de medicamentos en stock dentro de su propio flujo.
8. La gestión de umbrales no debe mostrarse a `farmaceutico` ni `recepcionista_med`.

---

## 9. Pendientes de alineación funcional

- Documentar historial completo mostrado dentro del flujo de recetas.
- Alinear permanencia del JWT: sin expiración por ahora; si se activa, usar 15 dias.
- Exponer historial y configuración admin en navegación de forma consistente.
