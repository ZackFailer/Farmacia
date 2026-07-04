# Checklist de Ejecución — ApoPharma

> **Estrategia**: Frontend first con mocks a nivel de servicio → Backend después → Integración.
> **Contexto**: App provisional para emergencia. Stack: Angular 21 + Ionic 8 (FE), NestJS 11 (BE), SQLite, PM2.

---

## 📋 Guía de Uso

- **Marcar con `[x]`** cuando un item esté completado.
- Cada archivo debe seguir el `design-system.md` (colores, espaciado, patrones de modales, formularios, listas).
- Cada servicio debe tener su mock (`*.mock.ts`) proveído en `app.config.ts`.
- Testing mínimo: unit test en servicios con lógica de negocio.
- Usar `@frontend` agent para tareas frontend, `@backend` para backend.

---

## Fase 0 — Base Compartida ✅

> **Estado: COMPLETADA** — Todos los archivos de base creados y build exitoso.

### 0.1 Modelos Compartidos (`shared/models/`)

- [x] `medicamento.model.ts`
- [x] `lote.model.ts`
- [x] `paciente.model.ts`
- [x] `dispensacion.model.ts`
- [x] `usuario.model.ts`
- [x] `configuracion.model.ts`
- [x] `stock-item.model.ts`

### 0.2 Enumeradores Compartidos (`shared/enums/`)

- [x] `rol.enum.ts`
- [x] `sexo.enum.ts`
- [x] `tipo-movimiento.enum.ts`

### 0.3 Estilos Globales

- [x] `styles.scss` — Variables CSS del design system aplicadas

### 0.4 Layout Base

- [x] `app.ts` — Con `<ion-app>` + `<ion-router-outlet>`
- [x] `app.routes.ts` — Todas las rutas lazy-loaded
- [x] `app.config.ts` — Providers: Router, Ionic, HttpClient, interceptors
- [x] `app.html` — Template base

### 0.5 Estructura de Directorios

- [x] Directorios creados para todos los módulos

---


## Fase 1 — Módulo de Autenticación ✅

> **Estado: COMPLETADA** — Build y tests exitosos (5 tests).

### Servicios

- [x] `auth/services/auth.service.ts` — Clase abstracta con métodos login, logout, getToken, getUsuario, isLoggedIn, getMe
- [x] `auth/services/auth.service.mock.ts` — Mock con seed admin / 123456
- [x] Test: `auth.service.spec.ts` — 5 tests (PIN inválido, login ok, isLoggedIn, logout, sin sesión)

### Página

- [x] `auth/pages/login.page.ts` — Teclado numérico táctil con PIN display, auto-login, toast de error, redirect por rol

### Guards & Interceptors

- [x] `auth/guards/auth.guard.ts` — Verifica token, redirige a /login
- [x] `core/guards/role.guard.ts` — Verifica rol del usuario
- [x] `core/interceptors/auth.interceptor.ts` — Adjunta JWT a requests
- [x] `core/interceptors/error.interceptor.ts` — Captura 401 y hace logout

### Rutas

- [x] `auth/auth.routes.ts` — Login es carga directa desde app.routes

---

## Fase 2 — Módulo de Recepción ✅

> **Estado: COMPLETADA** — Build y tests exitosos.

### Servicios

- [x] `recepcion/services/recepcion.service.ts` — Interfaz con métodos getMedicamentos, crearMedicamento, getLotes, crearLote, getLoteQR
- [x] `recepcion/services/recepcion.service.mock.ts` — Mock con 10 medicamentos y 5 lotes de ejemplo

### Página

- [x] `recepcion/pages/dashboard-ingresos.page.ts` — Header, searchbar, lista con TablaIngresosComponent, FAB "+", filtro cliente

### Modales

- [x] `recepcion/modals/ingreso-lote.modal.ts` — Autocompletado, alerta vencimiento < 3m, Crear nuevo medicamento, sigue patrón design-system
- [x] `recepcion/modals/nuevo-medicamento.modal.ts` — Campos: nombre genérico, comercial, presentación, concentración, unidad
- [x] `recepcion/modals/imprimir-etiqueta.modal.ts` — Template etiqueta, @media print, botón Imprimir

### Componentes

- [x] `recepcion/components/tabla-ingresos.component.ts` — Input lotes, Output reimprimir, indicador ⚠️ próximo vencimiento

### Rutas

- [x] `recepcion/recepcion.routes.ts` — `/recepcion` → DashboardIngresosPage

---

## Fase 3 — Módulo de Inventario ✅

> **Estado: COMPLETADA** — Build exitoso.

### Servicios

- [x] `inventario/services/inventario.service.ts`:
  - `getStockGeneral(params?: { search?, ubicacion? }): Observable<StockItem[]>`
  - `getProximosVencer(): Observable<Lote[]>`
  - `ajustarStock(loteId: number, cantidadReal: number): Observable<Lote>`
  - `getMovimientosLote(loteId: number): Observable<TipoMovimiento[]>`
  - `getUmbrales(): Observable<Configuracion[]>`
  - `actualizarUmbral(id: number, umbral: number): Observable<Configuracion>`
- [x] `inventario/services/inventario.service.mock.ts` — Mock con 15 medicamentos y stocks variados

### Páginas

- [x] `inventario/pages/panel-stock.page.ts`:
  - Sección "Vitales" anclada al inicio (antibióticos, insulina, analgésicos)
  - Lista con `TarjetaMedicamentoComponent`
  - Filtros: búsqueda por nombre, select de ubicación
  - Alerta toast al cargar si hay stock bajo en vitales
  - Botón "Ver lotes" → abre `DetalleLoteModal`
  - Botón "Ajustar" → abre `AjusteStockModal`
- [x] `inventario/pages/configurar-umbrales.page.ts`:
  - Lista de medicamentos con umbral actual
  - Botón "Editar" → abre `EditarUmbralModal`

### Modales

- [x] `inventario/modals/ajuste-stock.modal.ts`:
  - Mostrar lote, medicamento, stock actual
  - Input: cantidad real contada
  - Calcular diferencia en tiempo real
  - Botón "Ajustar Stock" → PATCH
- [x] `inventario/modals/detalle-lote.modal.ts`:
  - Datos fijos del lote
  - Timeline de movimientos
  - Botón "Reimprimir QR"
- [x] `inventario/modals/editar-umbral.modal.ts`:
  - Input numérico para umbral mínimo
  - Guardar → PATCH

### Componentes

- [x] `shared/components/indicador-stock.component.ts`:
  - Input: `cantidad: number`, `umbral: number`
  - Output visual: color + texto según semáforo
  - Seguir patrón sección 7 del `design-system.md`
- [x] `inventario/components/tarjeta-medicamento.component.ts`:
  - Input: `medicamento`, `stockTotal`, `umbral`, `proximoVencer`
  - Output: `verLotes`, `ajustar`
  - Borde izquierdo con color según estado

### Rutas

- [x] `inventario/inventario.routes.ts`:
  - `/inventario` → `PanelStockPage` (farmaceutico, despachador)
  - `/inventario/umbrales` → `ConfigurarUmbralesPage` (solo farmaceutico)

---

## Fase 4 — Módulo de Dispensación ✅

> **Estado: COMPLETADA** — Build + 18 tests pasando. Bug fix: reset paciente al volver a paso1.

### Servicios

- [x] `dispensacion/services/dispensacion.service.ts`:
  - `registrarPaciente(dto: Partial<Paciente>): Observable<Paciente>`
  - `buscarPaciente(idEmergencia: string): Observable<Paciente>`
  - `buscarMedicamentos(search: string): Observable<Medicamento[]>`
  - `getLotesDisponibles(medicamentoId: number): Observable<Lote[]>`
  - `getLimiteDosis(medicamentoId: number): Observable<Configuracion>`
  - `crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion>`
  - Estado compartido con `signal()`: `paciente`, `items`, `paso`
  - `resetPaciente()` + `reiniciar()`
- [x] `dispensacion/services/dispensacion.service.mock.ts`

### Páginas (Flujo 3 pasos)

- [x] `dispensacion/pages/paso1-escanear-paciente.page.ts`:
  - Input manual de código + búsqueda automática con debounce
  - Botones: "Buscar paciente manual", "Registrar nuevo paciente"
  - Al identificar paciente: mostrar datos + botón "Ver historial"
  - Botón "Siguiente →" habilitado solo con paciente identificado
  - `ionViewWillEnter` para resetear estado local al volver
- [x] `dispensacion/pages/paso2-seleccionar-meds.page.ts`:
  - Botón "Buscar medicamento" → modal
  - Lista de receta actual con botón eliminar [✕]
  - Stock disponible por item
  - Botón "Siguiente →" con al menos 1 item
  - "← Anterior" llama a `resetPaciente()` antes de navegar
- [x] `dispensacion/pages/paso3-confirmar.page.ts`:
  - Resumen: paciente + cada item con dosis calculada
  - Validación de dosis por item
  - Botón "Confirmar Entrega" → POST
  - Opción "Nueva dispensación" al terminar

### Modales

- [x] `dispensacion/modals/registro-paciente.modal.ts`:
  - Campos: ID emergencia, sexo (M/F toggle), edad, peso, damnificado (Sí/No toggle)
  - Al guardar → POST → seleccionar automáticamente
- [x] `dispensacion/modals/busqueda-paciente.modal.ts`:
  - Input de ID emergencia + botón Buscar
  - Opción "Registrar nuevo" si no encuentra
- [x] `dispensacion/modals/busqueda-medicamento.modal.ts`:
  - Búsqueda con debounce + resultados
  - Selector de lote (FEFO) + cantidad
  - Botón "Agregar a receta"
- [x] `dispensacion/modals/validacion-dosis.modal.ts`:
  - Mostrar: medicamento, dosis calculada, dosis máxima
  - Botones: "Cancelar" (quitar item), "Continuar de todas formas"
- [x] `dispensacion/modals/confirmacion-entrega.modal.ts`:
  - Resumen final
  - Loading state
  - Botón "Confirmar"

### Componentes

- [x] `shared/components/encabezado-paso.component.ts`:
  - Input: `paso: number`, `totalPasos: number`
  - Barra de progreso + texto "Paso X/3"
- [ ] `shared/components/escaner-qr.component.ts` ⏳ PENDIENTE
  - Placeholder con icono `scan-outline`
  - Al tocar: activar cámara
  - Output: `codigoEscaneado: string`
- [ ] `shared/components/buscador.component.ts` ⏳ PENDIENTE
  - Input: `items`, `placeholder`
  - Output: `seleccionado`
  - `ion-searchbar` + lista de resultados
- [x] `dispensacion/components/resumen-receta.component.ts`:
  - Input: `items`
  - Tabla con medicamento, lote, cantidad, dosis

### Guards

- [x] `dispensacion/guards/paso.guard.ts` — Verifica que paso anterior completado

### Rutas

- [x] `dispensacion/dispensacion.routes.ts`:
  - `/dispensacion/paso1` → `Paso1EscanearPacientePage`
  - `/dispensacion/paso2` → `Paso2SeleccionarMedsPage`
  - `/dispensacion/paso3` → `Paso3ConfirmarPage`
  - Todas protegidas (farmaceutico, despachador) + `PasoGuard`

---

## Fase 5 — Módulo de Historial ✅

> **Estado: COMPLETADA** — Build + 5 tests pasando.

### Servicios

- [x] `historial/services/historial.service.ts`:
  - `getHistorialPaciente(idEmergencia: string): Observable<Dispensacion[]>`
  - `getDetalleDispensacion(id: number): Observable<Dispensacion>`
- [x] `historial/services/historial.service.mock.ts`

### Página

- [x] `historial/pages/historial-paciente.page.ts`:
  - Datos del paciente en cabecera
  - Lista de dispensaciones por fecha DESC
  - Indicador visual de damnificado
  - Botón "Ver detalle" → modal

### Modales

- [x] `historial/modals/detalle-dispensacion.modal.ts`:
  - Fecha, despachador, paciente, peso
  - Tabla detallada de items
  - Observaciones
  - Botón "Cerrar"

### Rutas

- [x] `historial/historial.routes.ts`:
  - `/historial/:pacienteId` → `HistorialPacientePage`

---

## Fase 6 — Módulo de Administración ✅

> **Estado: COMPLETADA** — Build + 9 tests pasando. Guards con `roleGuard([Rol.FARMACEUTICO])` en rutas.

### Servicios

- [x] `administracion/services/administracion.service.ts`:
  - `getUsuarios(): Observable<Usuario[]>`
  - `crearUsuario(dto): Observable<Usuario>`
  - `actualizarUsuario(id, dto): Observable<Usuario>`
  - `eliminarUsuario(id): Observable<void>`
  - `getConfiguraciones(): Observable<Configuracion[]>`
  - `actualizarConfiguracion(id, dto): Observable<Configuracion>`
- [x] `administracion/services/administracion.service.mock.ts`

### Páginas

- [x] `administracion/pages/gestion-usuarios.page.ts`:
  - Lista de usuarios con nombre, rol, acciones
  - Botón "+ Nuevo Usuario"
  - Botón "Editar", "Eliminar" por usuario
  - Confirmación antes de eliminar
- [x] `administracion/pages/configuracion-general.page.ts`:
  - Secciones: Umbrales de Stock + Límites de Dosis
  - Lista por medicamento con valores actuales
  - Botón "Editar" en cada item

### Modales

- [x] `administracion/modals/crear-editar-usuario.modal.ts`:
  - Campos: nombre*, rol*, PIN*, confirmar PIN*
  - Validar PIN 4-6 dígitos y coincidencia
  - Modo creación vs edición
- [x] `administracion/modals/limites-dosis.modal.ts`:
  - Medicamento (solo lectura)
  - Inputs: dosis máxima (mg/kg), peso referencia (kg)
  - Validar números positivos

### Guards

- [x] `administracion/guards/admin.guard.ts` — Solo rol `farmaceutico`
  - Reemplazado por `roleGuard([Rol.FARMACEUTICO])` inline en rutas

### Rutas

- [x] `administracion/administracion.routes.ts`:
  - `/admin/usuarios` → `GestionUsuariosPage` (solo farmaceutico)
  - `/admin/configuracion` → `ConfiguracionGeneralPage` (solo farmaceutico)

---

## 🌐 Layout + Navegación Global ✅

> **Estado: COMPLETADA** — Menú lateral con `ion-menu`, botón de logout en footer, `ion-menu-button` en headers de todas las páginas, `swipeGesture=false` en login.

- [x] `app.ts` + `app.html` + `app.scss` — `<ion-menu>` sidebar con 5 items + "Cerrar Sesión" en footer
- [x] `app.routes.ts` — Ruta login+guard, admin con guards, resto con auth+role

---

## Fase 7 — Pipes, Componentes y Servicios Transversales ✅

> **Estado: COMPLETADA** — Build + 38 tests pasando.

- [x] `shared/pipes/fecha-relativa.pipe.ts`:
  - Input: `Date | string`
  - Output: "hace 2 horas", "ayer", "hace 3 días", etc.
  - Integrado en historial (lista + detalle) y movimientos de lote
- [x] `core/services/escaner.service.ts`:
  - Servicio singleton `EscanerService` con `iniciar(videoElement)`, `detener()`, `simularEscaneo(codigo)`
  - Usa `navigator.mediaDevices.getUserMedia` con `facingMode: 'environment'`
  - Fallback: emite `MOCK-001` si falla permiso de cámara
- [x] `shared/components/escaner-qr.component.ts`:
  - Placeholder con icono `scan-outline`, video real al activar, botón "Cancelar"
  - Emite `(codigoEscaneado)` al recibir código
  - Integrado en paso1 (paciente) y paso2 (lote) de dispensación
- [x] `shared/components/buscador.component.ts`:
  - Genérico `<app-buscador [items] [placeholder] [displayFn] (seleccionado)>`
  - `ion-searchbar` con debounce + filtrado local + lista de resultados
- [x] Servicio `getLoteByQR()` agregado a `DispensacionService` + mock

---

## Fase 8 — Backend (Post-Frontend) ⏳

> **Estado: PENDIENTE** — No iniciado.

> ⚠️ Esta fase se ejecuta DESPUÉS de completar todo el frontend con mocks.

### Autenticación

- [ ] Entidad `Usuario` con `pin_hash` (bcrypt)
- [ ] Seed: usuario `admin` / PIN `123456`
- [ ] `POST /api/v1/auth/login` → valida PIN, firma JWT (sin expiración)
- [ ] `GET /api/v1/auth/me` → retorna usuario desde token

### Recepción

- [ ] Entidad `Medicamento`
- [ ] Entidad `Lote` con FK → Medicamento
- [ ] `GET /api/v1/medicamentos?search=`
- [ ] `POST /api/v1/medicamentos`
- [ ] `GET /api/v1/lotes` (paginado, DESC)
- [ ] `POST /api/v1/lotes` (genera UUID QR)
- [ ] `GET /api/v1/lotes/:id/qr`

### Inventario

- [ ] `GET /api/v1/inventario` (stock agrupado por medicamento)
- [ ] `GET /api/v1/inventario/proximos-vencer`
- [ ] `PATCH /api/v1/lotes/:id/ajustar-stock`
- [ ] `GET /api/v1/lotes/:id/movimientos`
- [ ] `GET /api/v1/configuraciones/umbrales`
- [ ] `PATCH /api/v1/configuraciones/:id/umbral`

### Dispensación

- [ ] Entidad `Paciente`
- [ ] Entidad `Dispensacion` + `DispensacionDetalle`
- [ ] `POST /api/v1/pacientes`
- [ ] `GET /api/v1/pacientes/:idEmergencia`
- [ ] `GET /api/v1/lotes/disponibles/:medicamentoId` (FEFO)
- [ ] `GET /api/v1/configuraciones/:medicamentoId/dosis`
- [ ] `POST /api/v1/dispensaciones` (transacción: crea + descuenta stock)

### Historial

- [ ] `GET /api/v1/pacientes/:idEmergencia/dispensaciones`
- [ ] `GET /api/v1/dispensaciones/:id`

### Administración

- [ ] `GET /api/v1/usuarios`
- [ ] `POST /api/v1/usuarios`
- [ ] `PATCH /api/v1/usuarios/:id`
- [ ] `DELETE /api/v1/usuarios/:id` (validar último admin)
- [ ] `GET /api/v1/configuraciones`
- [ ] `PATCH /api/v1/configuraciones/:id`
- [ ] Hook: crear `Configuracion` por defecto al crear `Medicamento`

---

## Fase 9 — Integración y Despliegue ⏳

> **Estado: PENDIENTE** — No iniciado.

- [ ] Reemplazar `useClass: Mock*Service` por servicios reales en `app.config.ts`
- [ ] Probar flujo completo: Login → Recepción → Inventario → Dispensación → Historial
- [ ] `ng build frontend` → genera `dist/frontend/`
- [ ] `nest build backend` → genera `dist/backend/`
- [ ] Configurar NestJS para servir estáticos: `app.useStaticAssets(join(__dirname, '../../frontend/browser'))`
- [ ] Instalar PM2: `npm install -g pm2`
- [ ] Crear `ecosystem.config.js` para PM2
- [ ] Probar app en http://localhost:3000 (desde NestJS sirviendo frontend + API)

---

## Referencias Rápidas

| Recurso | Ubicación |
|---|---|
| Guía de diseño vinculante | `design-system.md` |
| Plan frontend | `documents/frontend-plan.md` |
| Plan backend | `documents/backend-plan.md` |
| Agente frontend | `@frontend` |
| Agente backend | `@backend` |
| Módulo auth | `documents/modules/autenticacion/` |
| Módulo recepción | `documents/modules/recepcion/` |
| Módulo inventario | `documents/modules/inventario/` |
| Módulo dispensación | `documents/modules/dispensacion/` |
| Módulo historial | `documents/modules/historial/` |
| Módulo admin | `documents/modules/administracion/` |
| Convenciones proyecto | `AGENTS.md` |

---

## Notas

- **Login**: al completar 4 dígitos del PIN, intenta login automático.
- **Redirección post-login**: farmaceutico → `/recepcion`, despachador → `/dispensacion/paso1`.
- **Seed**: único usuario `admin` / PIN `123456` / rol `farmaceutico`.
- **Mock services**: data hardcodeada en arrays dentro del mock, sin persistencia.
- **Despliegue final**: NestJS sirve el frontend compilado como estático + API en mismo puerto.
