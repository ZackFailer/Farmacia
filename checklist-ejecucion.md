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

## Fase 0 — Base Compartida

### 0.1 Modelos Compartidos (`shared/models/`)

- [ ] `medicamento.model.ts`
  ```typescript
  export interface Medicamento {
    id: number;
    nombre_generico: string;
    nombre_comercial?: string;
    presentacion: string;
    concentracion: number;
    unidad_concentracion: 'mg' | 'ml' | 'UI';
    created_at: string;
    updated_at: string;
  }
  ```
- [ ] `lote.model.ts`
  ```typescript
  export interface Lote {
    id: number;
    medicamento_id: number;
    medicamento?: Medicamento;
    codigo_qr: string;
    cantidad_inicial: number;
    cantidad_actual: number;
    fecha_vencimiento: string;
    donante?: string;
    ubicacion?: string;
    created_at: string;
    updated_at: string;
  }
  ```
- [ ] `paciente.model.ts`
  ```typescript
  export interface Paciente {
    id: number;
    id_emergencia: string;
    sexo: Sexo;
    edad_estimada: number;
    peso_estimado: number;
    es_damnificado: boolean;
    created_at: string;
  }
  ```
- [ ] `dispensacion.model.ts`
  ```typescript
  export interface DispensacionDetalle {
    id: number;
    dispensacion_id: number;
    lote_id: number;
    medicamento_id: number;
    cantidad: number;
    dosis_mg_kg?: number;
    created_at: string;
  }
  
  export interface Dispensacion {
    id: number;
    paciente_id: number;
    usuario_id: number;
    fecha_hora: string;
    observaciones?: string;
    items: DispensacionDetalle[];
    despachado_por?: string;
    paciente?: Paciente;
  }
  ```
- [ ] `usuario.model.ts`
  ```typescript
  export interface Usuario {
    id: number;
    nombre: string;
    rol: Rol;
    created_at: string;
    updated_at: string;
  }
  ```
- [ ] `configuracion.model.ts`
  ```typescript
  export interface Configuracion {
    id: number;
    medicamento_id: number;
    medicamento?: Medicamento;
    umbral_minimo: number;
    dosis_maxima_mg_kg?: number;
    peso_referencia_kg?: number;
    updated_at: string;
  }
  ```

### 0.2 Enumeradores Compartidos (`shared/enums/`)

- [ ] `rol.enum.ts` — `export enum Rol { FARMACEUTICO = 'farmaceutico', DESPACHADOR = 'despachador' }`
- [ ] `sexo.enum.ts` — `export enum Sexo { M = 'M', F = 'F' }`
- [ ] `tipo-movimiento.enum.ts` — `export enum TipoMovimiento { INGRESO = 'ingreso', DISPENSACION = 'dispensacion', AJUSTE = 'ajuste' }`

### 0.3 Estilos Globales

- [ ] `styles.scss` — Aplicar todas las variables CSS del `design-system.md`:
  - Colores base (`--app-primary`, `--app-bg`, etc.)
  - Colores semáforo (`--stock-ok`, `--stock-bajo`, `--stock-agotado`)
  - Tipografía (`--app-font-family`, tamaños)
  - Espaciado (`--app-space-*`)
  - Radios (`--app-radius-*`)

### 0.4 Layout Base

- [ ] `app.ts` — Estructura con `<ion-app>` y `<ion-router-outlet>`
- [ ] `app.routes.ts` — Definir todas las rutas lazy-loaded:
  ```typescript
  export const appRoutes: Route[] = [
    { path: 'login', loadComponent: () => import('./auth/pages/login.page').then(m => m.LoginPage) },
    { path: 'recepcion', loadChildren: () => import('./recepcion/recepcion.routes').then(m => m.recepcionRoutes) },
    { path: 'inventario', loadChildren: () => import('./inventario/inventario.routes').then(m => m.inventarioRoutes) },
    { path: 'dispensacion', loadChildren: () => import('./dispensacion/dispensacion.routes').then(m => m.dispensacionRoutes) },
    { path: 'historial/:pacienteId', loadChildren: () => import('./historial/historial.routes').then(m => m.historialRoutes) },
    { path: 'admin', loadChildren: () => import('./administracion/administracion.routes').then(m => m.administracionRoutes) },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
  ];
  ```
- [ ] `app.config.ts` — Providers:
  - `provideRouter(appRoutes)`, `provideIonicAngular()`, `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`
  - Proveer servicios MOCK: `{ provide: AuthService, useClass: MockAuthService }`

### 0.5 Estructura de Directorios

- [ ] Crear estructura de carpetas completa:
  ```
  src/app/
    auth/pages/, services/, guards/, auth.routes.ts
    recepcion/pages/, modals/, services/, components/, recepcion.routes.ts
    inventario/pages/, modals/, services/, components/, inventario.routes.ts
    dispensacion/pages/, modals/, services/, components/, guards/, dispensacion.routes.ts
    historial/pages/, modals/, services/, historial.routes.ts
    administracion/pages/, modals/, services/, guards/, administracion.routes.ts
    shared/models/, enums/, components/, pipes/
    core/interceptors/, services/, guards/
  ```

---

## Fase 1 — Módulo de Autenticación

### Servicios

- [ ] `auth/services/auth.service.ts` — Interfaz abstracta:
  - `login(pin: string): Observable<{ token: string; usuario: Usuario }>`
  - `logout(): void`
  - `getToken(): string | null`
  - `getUsuario(): Usuario | null`
  - `isLoggedIn(): boolean`
  - `getMe(): Observable<Usuario>`
- [ ] `auth/services/auth.service.mock.ts` — Mock:
  - Usuario seed: admin / PIN `123456` / rol `farmaceutico`
  - `login()`: validar PIN hardcodeado, retornar token fake + usuario
  - `getUsuario()`: leer de `localStorage`
- [ ] Test: `auth.service.spec.ts`

### Página

- [ ] `auth/pages/login.page.ts` — Teclado numérico táctil:
  - Input tipo PIN con `●`, 4-6 dígitos
  - Teclado numérico virtual (botones 0-9 + ⌫)
  - Auto-login al completar 4 dígitos
  - Error "PIN inválido" con `ion-toast`
  - Redirigir según rol: farmaceutico → `/recepcion`, despachador → `/dispensacion/paso1`
  - Seguir patrón de página en `design-system.md` sección 5.1

### Guards & Interceptors

- [ ] `auth/guards/auth.guard.ts` — Verificar token en localStorage, redirigir a `/login`
- [ ] `core/guards/role.guard.ts` — Verificar rol del usuario contra roles permitidos
- [ ] `core/interceptors/auth.interceptor.ts` — Adjuntar `Authorization: Bearer <token>` a cada request
- [ ] `core/interceptors/error.interceptor.ts` — Capturar 401 → logout automático

### Rutas

- [ ] `auth/auth.routes.ts` — (Login es carga directa, no lazy module)

---

## Fase 2 — Módulo de Recepción

### Servicios

- [ ] `recepcion/services/recepcion.service.ts` — Interfaz:
  - `getMedicamentos(search?: string): Observable<Medicamento[]>`
  - `crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento>`
  - `getLotes(page?: number, limit?: number): Observable<Lote[]>`
  - `crearLote(dto: Partial<Lote>): Observable<Lote>`
  - `getLoteQR(id: number): Observable<Blob>`
- [ ] `recepcion/services/recepcion.service.mock.ts` — Mock con 10 medicamentos y 5 lotes de ejemplo

### Página

- [ ] `recepcion/pages/dashboard-ingresos.page.ts`:
  - Header con título "Recepción"
  - `ion-searchbar` para filtrar lotes
  - Lista de lotes recientes con `TablaIngresosComponent`
  - FAB "+" para nuevo ingreso
  - Indicador ⚠️ en lotes próximos a vencer (< 3 meses)
  - Botón "Reimprimir QR" por lote

### Modales

- [ ] `recepcion/modals/ingreso-lote.modal.ts`:
  - Autocompletado de medicamento con debounce 300ms
  - Enlace "Crear nuevo medicamento" → abre `NuevoMedicamentoModal`
  - Campos: presentación (prellenado), concentración (prellenado), cantidad, fecha venc, donante, ubicación
  - Alerta visual si fecha < 3 meses
  - Botón Guardar → POST /lotes → abre `ImprimirEtiquetaModal`
  - Seguir patrón de modal en `design-system.md` sección 5.2
- [ ] `recepcion/modals/nuevo-medicamento.modal.ts`:
  - Campos: nombre genérico*, nombre comercial, presentación*, concentración*, unidad*
  - Al guardar: seleccionar automáticamente en modal padre
- [ ] `recepcion/modals/imprimir-etiqueta.modal.ts`:
  - Template de etiqueta con datos del lote + QR generado con librería `qrcode`
  - Botón "Imprimir" → `window.print()` con `@media print`
  - Botón "Cerrar"

### Componentes

- [ ] `recepcion/components/tabla-ingresos.component.ts`:
  - Input: `lotes: Lote[]`
  - Output: `reimprimir: EventEmitter<number>`
  - Mostrar medicamento, lote, vencimiento, cantidad, donante

### Rutas

- [ ] `recepcion/recepcion.routes.ts`:
  - `/recepcion` → `DashboardIngresosPage` (protegido: farmaceutico, despachador)

---

## Fase 3 — Módulo de Inventario

### Servicios

- [ ] `inventario/services/inventario.service.ts`:
  - `getStockGeneral(params?: { search?, ubicacion? }): Observable<StockItem[]>`
  - `getProximosVencer(): Observable<Lote[]>`
  - `ajustarStock(loteId: number, cantidadReal: number): Observable<Lote>`
  - `getMovimientosLote(loteId: number): Observable<TipoMovimiento[]>`
  - `getUmbrales(): Observable<Configuracion[]>`
  - `actualizarUmbral(id: number, umbral: number): Observable<Configuracion>`
- [ ] `inventario/services/inventario.service.mock.ts` — Mock con 15 medicamentos y stocks variados

### Páginas

- [ ] `inventario/pages/panel-stock.page.ts`:
  - Sección "Vitales" anclada al inicio (antibióticos, insulina, analgésicos)
  - Lista con `TarjetaMedicamentoComponent`
  - Filtros: búsqueda por nombre, select de ubicación
  - Alerta toast al cargar si hay stock bajo en vitales
  - Botón "Ver lotes" → abre `DetalleLoteModal`
  - Botón "Ajustar" → abre `AjusteStockModal`
- [ ] `inventario/pages/configurar-umbrales.page.ts`:
  - Lista de medicamentos con umbral actual
  - Botón "Editar" → abre `EditarUmbralModal`

### Modales

- [ ] `inventario/modals/ajuste-stock.modal.ts`:
  - Mostrar lote, medicamento, stock actual
  - Input: cantidad real contada
  - Calcular diferencia en tiempo real
  - Botón "Ajustar Stock" → PATCH
- [ ] `inventario/modals/detalle-lote.modal.ts`:
  - Datos fijos del lote
  - Timeline de movimientos
  - Botón "Reimprimir QR"
- [ ] `inventario/modals/editar-umbral.modal.ts`:
  - Input numérico para umbral mínimo
  - Guardar → PATCH

### Componentes

- [ ] `shared/components/indicador-stock.component.ts`:
  - Input: `cantidad: number`, `umbral: number`
  - Output visual: color + texto según semáforo
  - Seguir patrón sección 7 del `design-system.md`
- [ ] `inventario/components/tarjeta-medicamento.component.ts`:
  - Input: `medicamento`, `stockTotal`, `umbral`, `proximoVencer`
  - Output: `verLotes`, `ajustar`
  - Borde izquierdo con color según estado

### Rutas

- [ ] `inventario/inventario.routes.ts`:
  - `/inventario` → `PanelStockPage` (farmaceutico, despachador)
  - `/inventario/umbrales` → `ConfigurarUmbralesPage` (solo farmaceutico)

---

## Fase 4 — Módulo de Dispensación

### Servicios

- [ ] `dispensacion/services/dispensacion.service.ts`:
  - `registrarPaciente(dto: Partial<Paciente>): Observable<Paciente>`
  - `buscarPaciente(idEmergencia: string): Observable<Paciente>`
  - `buscarMedicamentos(search: string): Observable<Medicamento[]>`
  - `getLotesDisponibles(medicamentoId: number): Observable<Lote[]>`
  - `getLimiteDosis(medicamentoId: number): Observable<Configuracion>`
  - `crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion>`
  - Estado compartido con `signal()`: `paciente`, `items`, `paso`
- [ ] `dispensacion/services/dispensacion.service.mock.ts`

### Páginas (Flujo 3 pasos)

- [ ] `dispensacion/pages/paso1-escanear-paciente.page.ts`:
  - Área de escáner QR (componente `EscanerQrComponent`)
  - Botones: "Buscar paciente manual", "Registrar nuevo paciente"
  - Al identificar paciente: mostrar datos + botón "Ver historial"
  - Botón "Siguiente →" habilitado solo con paciente identificado
- [ ] `dispensacion/pages/paso2-seleccionar-meds.page.ts`:
  - Escáner QR para lote
  - Botón "Buscar medicamento" → modal
  - Lista de receta actual con botón eliminar [✕]
  - Stock disponible por item
  - Botón "Siguiente →" con al menos 1 item
- [ ] `dispensacion/pages/paso3-confirmar.page.ts`:
  - Resumen: paciente + cada item con dosis calculada
  - Validación de dosis por item
  - Botón "Confirmar Entrega" → POST
  - Opción "Nueva dispensación" al terminar

### Modales

- [ ] `dispensacion/modals/registro-paciente.modal.ts`:
  - Campos: ID emergencia, sexo (M/F toggle), edad, peso, damnificado (Sí/No toggle)
  - Al guardar → POST → seleccionar automáticamente
- [ ] `dispensacion/modals/busqueda-paciente.modal.ts`:
  - Input de ID emergencia + botón Buscar
  - Opción "Registrar nuevo" si no encuentra
- [ ] `dispensacion/modals/busqueda-medicamento.modal.ts`:
  - Búsqueda con debounce + resultados
  - Selector de lote (FEFO) + cantidad
  - Botón "Agregar a receta"
- [ ] `dispensacion/modals/validacion-dosis.modal.ts`:
  - Mostrar: medicamento, dosis calculada, dosis máxima
  - Botones: "Cancelar" (quitar item), "Continuar de todas formas"
- [ ] `dispensacion/modals/confirmacion-entrega.modal.ts`:
  - Resumen final
  - Loading state
  - Botón "Confirmar"

### Componentes

- [ ] `shared/components/encabezado-paso.component.ts`:
  - Input: `paso: number`, `totalPasos: number`
  - Barra de progreso + texto "Paso X/3"
- [ ] `shared/components/escaner-qr.component.ts`:
  - Placeholder con icono `scan-outline`
  - Al tocar: activar cámara
  - Output: `codigoEscaneado: string`
- [ ] `shared/components/buscador.component.ts`:
  - Input: `items`, `placeholder`
  - Output: `seleccionado`
  - `ion-searchbar` + lista de resultados
- [ ] `dispensacion/components/resumen-receta.component.ts`:
  - Input: `items`
  - Tabla con medicamento, lote, cantidad, dosis

### Guards

- [ ] `dispensacion/guards/paso.guard.ts` — Verifica que paso anterior completado

### Rutas

- [ ] `dispensacion/dispensacion.routes.ts`:
  - `/dispensacion/paso1` → `Paso1EscanearPacientePage`
  - `/dispensacion/paso2` → `Paso2SeleccionarMedsPage`
  - `/dispensacion/paso3` → `Paso3ConfirmarPage`
  - Todas protegidas (farmaceutico, despachador) + `PasoGuard`

---

## Fase 5 — Módulo de Historial

### Servicios

- [ ] `historial/services/historial.service.ts`:
  - `getHistorialPaciente(idEmergencia: string): Observable<Dispensacion[]>`
  - `getDetalleDispensacion(id: number): Observable<Dispensacion>`
- [ ] `historial/services/historial.service.mock.ts`

### Página

- [ ] `historial/pages/historial-paciente.page.ts`:
  - Datos del paciente en cabecera
  - Lista de dispensaciones por fecha DESC
  - Indicador visual de damnificado
  - Botón "Ver detalle" → modal

### Modales

- [ ] `historial/modals/detalle-dispensacion.modal.ts`:
  - Fecha, despachador, paciente, peso
  - Tabla detallada de items
  - Observaciones
  - Botón "Cerrar"

### Rutas

- [ ] `historial/historial.routes.ts`:
  - `/historial/:pacienteId` → `HistorialPacientePage`

---

## Fase 6 — Módulo de Administración

### Servicios

- [ ] `administracion/services/administracion.service.ts`:
  - `getUsuarios(): Observable<Usuario[]>`
  - `crearUsuario(dto): Observable<Usuario>`
  - `actualizarUsuario(id, dto): Observable<Usuario>`
  - `eliminarUsuario(id): Observable<void>`
  - `getConfiguraciones(): Observable<Configuracion[]>`
  - `actualizarConfiguracion(id, dto): Observable<Configuracion>`
- [ ] `administracion/services/administracion.service.mock.ts`

### Páginas

- [ ] `administracion/pages/gestion-usuarios.page.ts`:
  - Lista de usuarios con nombre, rol, acciones
  - Botón "+ Nuevo Usuario"
  - Botón "Editar", "Eliminar" por usuario
  - Confirmación antes de eliminar
- [ ] `administracion/pages/configuracion-general.page.ts`:
  - Secciones: Umbrales de Stock + Límites de Dosis
  - Lista por medicamento con valores actuales
  - Botón "Editar" en cada item

### Modales

- [ ] `administracion/modals/crear-editar-usuario.modal.ts`:
  - Campos: nombre*, rol*, PIN*, confirmar PIN*
  - Validar PIN 4-6 dígitos y coincidencia
  - Modo creación vs edición
- [ ] `administracion/modals/limites-dosis.modal.ts`:
  - Medicamento (solo lectura)
  - Inputs: dosis máxima (mg/kg), peso referencia (kg)
  - Validar números positivos

### Guards

- [ ] `administracion/guards/admin.guard.ts` — Solo rol `farmaceutico`

### Rutas

- [ ] `administracion/administracion.routes.ts`:
  - `/admin/usuarios` → `GestionUsuariosPage` (solo farmaceutico)
  - `/admin/configuracion` → `ConfiguracionGeneralPage` (solo farmaceutico)

---

## Fase 7 — Pipes y Servicios Transversales

- [ ] `shared/pipes/fecha-relativa.pipe.ts`:
  - Input: `Date | string`
  - Output: "hace 2 horas", "ayer", "hace 3 días", etc.
- [ ] `core/services/escaner.service.ts`:
  - Servicio singleton que maneja ciclo de vida de cámara
  - Métodos: `iniciar()`, `detener()`, `escanear()`

---

## Fase 8 — Backend (Post-Frontend)

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

## Fase 9 — Integración y Despliegue

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
