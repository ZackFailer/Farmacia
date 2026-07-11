# Plan de Sincronización Offline — Formularios de Censo y Pacientes

> **Propósito**: Permitir que los formularios de registro de carpas, pacientes y núcleo
> familiar se completen sin conexión a la red. Los datos se guardan en una cola local
> (localStorage) y se sincronizan automáticamente cuando la conexión se restablece.
>
> **Contexto**: Red local inestable con cortes intermitentes de minutos. Dispositivos
> móviles (navegador web) que pierden conectividad frecuentemente. No hay app nativa.
>
> **Estrategia**: localStorage + cola FIFO + sincronización automática al reconectar.
> Sin cambios en el backend. Sin dependencias nuevas.
>
> **Estado de implementación**: 10/07/2026 — Fases 0, 1 y 2 completadas.
> Build y lint pasan sin errores. Fase 3 (UI avanzada, logout/login, action sheet)
> queda pendiente.

---

## 1. Propósito

- El usuario debe poder llenar **todos los formularios** de censo (carpas, pacientes en carpa)
  y pacientes (registro, edición, eliminación) **sin conexión a la red**.
- Los datos quedan en una **cola local** (`localStorage`) con indicador visual de pendientes.
- Cuando la conexión se restablece, la cola se **procesa automáticamente** (FIFO).
- Los catálogos de patologías y necesidades se **cachean localmente** para que los modales
  carguen aunque no haya red.
- El usuario recibe **feedback visual** constante: "Guardado en cola", "X pendientes",
  "Error al sincronizar".

---

## 2. Diseño de Arquitectura

### 2.1 Diagrama de componentes

```
┌─────────────────────────────────────────────────────────────┐
│                   SyncQueueService                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ enqueue()│→ │save()    │→ │process() │→ │remove()  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                      │              │                       │
│                      ▼              ▼                       │
│               localStorage     fetch() API                  │
│               "sync_queue"     (con token JWT)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   Connectivity   CacheCatalogo  SyncIndicator
   Service        Service        Component
   (señales)      (patologías,   (chip UI global)
                  necesidades)
          │            │
          ▼            ▼
   Páginas Censo   Páginas Pacientes
   + Modales       + Modales
```

### 2.2 Flujo de datos (offline)

```
Usuario llena formulario
        │
        ▼
Intenta enviar a API (POST/PATCH/DELETE)
        │
        ├── Éxito (2xx) → UI se actualiza normalmente
        │
        └── Error de red (0, timeout, no hay conexión)
                │
                ▼
        SyncQueueService.enqueue({
          type: 'CREATE_PATIENT',
          endpoint: '/api/v1/pacientes',
          method: 'POST',
          body: { ... dto del formulario },
          metadata: { descripcion: 'Registro: Juan Pérez' }
        })
                │
                ▼
        Toast: "Guardado en cola. Se sincronizará
                automáticamente cuando haya conexión."
                │
                ▼
        UI muestra estado offline
        SyncIndicatorComponent actualiza contador
```

### 2.3 Flujo de sincronización

```
window:online dispara
        │
        ▼
SyncQueueService.processQueue()
        │
        ▼
Para cada item (ordenado por createdAt ASC):
        │
        ├── Éxito (2xx) → remove() de la cola
        │                  → Toast: "Registro sincronizado"
        │
        ├── Error 409 (duplicado) → remove() de la cola
        │                           → (el registro ya existe en servidor)
        │
        ├── Error 4xx no recuperable → mark as 'failed'
        │                              → Toast: "Error al sincronizar"
        │
        └── Error de red / 5xx → retry++
                ├── retry < maxRetry → queda en cola (próximo ciclo)
                └── retry >= maxRetry → mark as 'failed'
```

### 2.4 Estructura de la cola (localStorage)

```typescript
interface SyncQueueItem {
  id: string;                    // uuid v4
  type: SyncOperationType;       // enum
  endpoint: string;              // ruta API relativa
  method: 'POST' | 'PATCH' | 'DELETE';
  body: unknown;                 // payload del request
  createdAt: string;             // ISO date
  retries: number;
  maxRetries: number;            // default 5
  status: 'pending' | 'failed';
  errorMessage?: string;
  metadata?: {
    descripcion: string;         // texto para el indicador UI
    codigoCarpa?: string;        // para contextos de carpa
    pacienteNombre?: string;     // para contextos de paciente
  };
}

enum SyncOperationType {
  CREATE_CARPA = 'CREATE_CARPA',
  UPDATE_CARPA = 'UPDATE_CARPA',
  DELETE_CARPA = 'DELETE_CARPA',
  CREATE_PATIENT = 'CREATE_PATIENT',
  UPDATE_PATIENT = 'UPDATE_PATIENT',
  DELETE_PATIENT = 'DELETE_PATIENT',
  ADD_MEMBER_CARPA = 'ADD_MEMBER_CARPA',
  MARK_NEED_SUPLIDA = 'MARK_NEED_SUPLIDA',
}
```

### 2.5 Items compuestos (registrar paciente + asignar carpa)

El modal `RegistrarPacienteCarpaModal` ejecuta **2 llamadas secuenciales**:
1. `POST /api/v1/pacientes` → crea el paciente
2. `POST /api/v1/censo/carpas/:codigo/miembros` → vincula a la carpa

El paso 2 necesita el `paciente.id` que genera el servidor.

**Solución offline**: guardar ambos pasos como items independientes pero vinculados:

```typescript
// Item 1
{
  id: 'uuid-1',
  type: 'CREATE_PATIENT',
  endpoint: '/api/v1/pacientes',
  method: 'POST',
  body: { /* dto completo del paciente */ },
  metadata: { tempId: -1, descripcion: 'Paciente: Juan Pérez' }
}

// Item 2 (depende del resultado del Item 1)
{
  id: 'uuid-2',
  type: 'ADD_MEMBER_CARPA',
  endpoint: '/api/v1/censo/carpas/CARPA-0001/miembros',
  method: 'POST',
  body: { pacienteId: null, relacion: 'Titular' },  // pacienteId se reemplaza al sincronizar
  metadata: { dependsOnTempId: -1, tempId: -1, descripcion: 'Vincular a carpa CARPA-0001' }
}
```

Al procesar:
1. Ejecutar Item 1 → obtener `response.id` real.
2. Reemplazar `pacienteId` en el body del Item 2 con el `response.id` real.
3. Ejecutar Item 2.

---

## 3. Alcance

### 3.1 Formularios y acciones cubiertas

| # | Ruta / Origen | Acción | Endpoint | Método | Prioridad | Estado |
|---|---|---|---|---|---|---|
| 1 | `/censo/crear-carpa` | Crear carpa | `/api/v1/censo/carpas` | POST | Alta | ✅ |
| 2 | `/censo/carpa/:codigo` (modal) | Registrar paciente en carpa | `/api/v1/pacientes` + `/api/v1/censo/carpas/:cod/miembros` | POST + POST | Alta | ✅ |
| 3 | `/censo/carpas` | Editar ubicación de carpa | `/api/v1/censo/carpas/:cod` | PATCH | Media | ✅ |
| 4 | `/censo/carpas` | Eliminar carpa | `/api/v1/censo/carpas/:cod` | DELETE | Media | ✅ |
| 5 | `/censo/carpa/:codigo` (componente) | Marcar necesidad suplida | `/api/v1/pacientes/:id/necesidades/:nid/suplida` | PATCH | Media | ✅ |
| 6 | `/pacientes` (modal `RegistroPacienteModal`) | Registrar paciente + familiares | `/api/v1/pacientes` | POST | Alta | ✅ |
| 7 | `/pacientes/:id` (modal `EditarPacienteModal`) | Editar paciente | `/api/v1/pacientes/:id` | PATCH | Alta | ✅ |
| 8 | `/pacientes` | Eliminar paciente (admin: hard, otro: soft) | `/api/v1/pacientes/:id` | DELETE / PATCH | Media | ✅ |
| 9 | `/pacientes` | Reactivar paciente | `/api/v1/pacientes/:id` | PATCH | Baja | ✅ |

### 3.2 Catálogos cacheados localmente

| Catálogo | Endpoint | Uso | Estrategia de cache |
|---|---|---|---|
| Patologías | `GET /api/v1/patologias` | Modales de registro/edición | Cache on first load, refresh on reconnect |
| Necesidades | `GET /api/v1/necesidades` | Modales de registro/edición | Cache on first load, refresh on reconnect |

### 3.3 Lo que NO cubre este plan

- **Lecturas de listas** (GET /censo/carpas, GET /pacientes?q=...): cuando no hay red,
  las páginas muestran estado "Sin conexión" con botón reintentar. No se cachean
  listas completas (sería complejo y el beneficio es marginal para cortes de minutos).
- **Sincronización bidireccional**: no se requiere. El backend es la fuente de verdad.
- **App nativa**: sigue siendo web, sin Capacitor.

---

## 4. Fases y Tareas

### Fase 0 — Infraestructura base

> Creación de los servicios compartidos que usarán todas las páginas.

#### Tarea 0.1 — ConnectivityService

- [x] **0.1.1** Crear `apps/frontend/src/app/core/services/connectivity.service.ts`
- [x] **0.1.2** Signal `isOnline` inicializado con `navigator.onLine`
- [x] **0.1.3** Listeners `window:online` / `window:offline` que actualizan la señal
- [x] **0.1.4** Signal `lastOnlineChange: Date` para tracking
- [x] **0.1.5** Método `isNetworkError()` helper para detectar errores de red

#### Tarea 0.2 — SyncQueueService

- [x] **0.2.1** Crear `apps/frontend/src/app/core/services/sync-queue.service.ts`
- [x] **0.2.2** Definir interfaces `SyncQueueItem`, `SyncOperationType`
- [x] **0.2.3** Método `enqueue(item)` — genera uuid, guarda en localStorage, actualiza signal `count`
- [x] **0.2.4** Método `getPending(): SyncQueueItem[]`
- [x] **0.2.5** Método `remove(id: string): void`
- [x] **0.2.6** Método `processQueue(): Promise<ProcessResult>` — procesa items FIFO con fetch()
  - [x] 0.2.6.1 Manejar items compuestos (dependencias entre CREATE_PATIENT y ADD_MEMBER_CARPA)
  - [x] 0.2.6.2 Reemplazar `tempId` con ID real del servidor en dependencias
- [x] **0.2.7** Signal `count: Signal<number>` reactiva (basada en items pending)
- [x] **0.2.8** Signal `failedCount: Signal<number>` reactiva
- [x] **0.2.9** Escuchar `window:online` para disparar `processQueue()` automáticamente
- [x] **0.2.10** `setInterval` cada 30s mientras haya items pendientes (reintento periódico)
- [x] **0.2.11** Extraer token JWT de `localStorage` para incluirlo en headers de sync
- [x] **0.2.12** Manejo de errores: 4xx no recuperable → failed, 5xx → retry++, 409 → remove
- [x] **0.2.13** Máximo 5 reintentos por item, luego marcar como `failed`

#### Tarea 0.3 — CacheCatalogoService

- [x] **0.3.1** Crear `apps/frontend/src/app/core/services/cache-catalogo.service.ts`
- [x] **0.3.2** Método `getPatologias(): Promise<Patologia[]>` — intenta HTTP; si falla, devuelve cache localStorage
- [x] **0.3.3** Método `getNecesidades(): Promise<Necesidad[]>` — mismo patrón
- [x] **0.3.4** Almacenar en localStorage con timestamp (`cache_patologias`, `cache_patologias_ts`)
- [x] **0.3.5** TTL de 30 minutos para el cache

#### Tarea 0.4 — SyncIndicatorComponent

- [x] **0.4.1** Crear `apps/frontend/src/app/shared/components/indicador-sync.component.ts`
- [x] **0.4.2** Template: `ion-chip` con icono y texto según estado:
  - Online sin pendientes: oculto
  - Offline: `cloud-offline-outline` + "Sin conexión"
  - Pendientes: `cloud-upload-outline` + "N pendientes"
  - Fallidos: `alert-circle-outline` + "N fallaron"
- [x] **0.4.3** Click: forzar sincronización o limpiar fallidos
- [x] **0.4.4** Inyecta `ConnectivityService` y `SyncQueueService`
- [x] **0.4.5** Integrar en el toolbar principal (`apps/frontend/src/app/app.ts` + `app.html`)

---

### Fase 1 — Offline: Módulo Censo

> Modificar páginas y modales del módulo Censo para soportar offline.

#### Tarea 1.1 — CrearCarpaPage

- [x] **1.1.1** Leer el archivo `crear-carpa.page.ts` para entender flujo actual
- [x] **1.1.2** En `crear()`: capturar error de red en la suscripción
- [x] **1.1.3** Si es error de red: llamar `syncQueue.enqueue()` con `type: CREATE_CARPA`
- [ ] **1.1.4** Mostrar pantalla "Guardado en cola" con datos ingresados y código tentativo
- [ ] **1.1.5** Generar código tentativo de carpa localmente (ej. `CARPA-OFFF-{seq}`)
- [x] **1.1.6** Mostrar toast "Guardado en cola. Se sincronizará cuando haya conexión."
- [ ] **1.1.7** Botón "Crear otra carpa" y "Ver pendientes" en la pantalla de cola
- [ ] **1.1.8** Al reconectar y sincronizar: toast de notificación si el usuario sigue en la página

#### Tarea 1.2 — RegistrarPacienteCarpaModal

- [x] **1.2.1** Leer el archivo `registrar-paciente-carpa.modal.ts` para entender flujo actual
- [x] **1.2.2** Reemplazar `getPatologias()` / `getNecesidades()` por `CacheCatalogoService`
- [x] **1.2.3** En `guardar()`: capturar error de red en ambos pasos (CREATE_PATIENT + ADD_MEMBER_CARPA)
- [x] **1.2.4** Si error en paso 1: guardar item compuesto (CREATE_PATIENT + ADD_MEMBER_CARPA con dependencia)
- [x] **1.2.5** Si error en paso 2 (paciente creado, pero falla vinculación): guardar solo ADD_MEMBER_CARPA
- [x] **1.2.6** Dismiss del modal con `{ success: true, offline: true }`
- [x] **1.2.7** Toast "Guardado en cola. Se sincronizará cuando haya conexión."

#### Tarea 1.3 — ListarCarpasPage (editar/eliminar carpa)

- [x] **1.3.1** Leer el archivo `listar-carpas.page.ts`
- [x] **1.3.2** En `editarUbicacion()`: capturar error de red → enqueue `UPDATE_CARPA`
- [x] **1.3.3** En `confirmarEliminar()`: capturar error de red → enqueue `DELETE_CARPA`
- [x] **1.3.4** Mostrar toast offline en ambos casos
- [ ] **1.3.5** Al cargar lista: mostrar indicador de "pendiente" en items con operaciones en cola

#### Tarea 1.4 — DetalleCarpaPage

- [x] **1.4.1** Leer `detalle-carpa.page.ts`
- [x] **1.4.2** En `cargar()`: si falla la red, mantener datos anteriores y mostrar mensaje "Sin conexión"
- [x] **1.4.3** Manejar `offline: true` del modal `RegistrarPacienteCarpaModal` → no recargar carpa
- [x] **1.4.4** Toast "Guardado en cola" cuando se registra un paciente offline

#### Tarea 1.5 — ListaNecesidadesPacienteComponent (marcar suplida)

- [x] **1.5.1** Leer `lista-necesidades-paciente.component.ts`
- [x] **1.5.2** En `marcarSuplida()`: capturar error de red → enqueue `MARK_NEED_SUPLIDA`
- [x] **1.5.3** Si offline: marcar visualmente como suplida localmente + toast offline
- [x] **1.5.4** Emitir `suplidaChange` igualmente para que la UI se actualice

---

### Fase 2 — Offline: Módulo Pacientes

> Modificar páginas y modales del módulo Pacientes para soportar offline.

#### Tarea 2.1 — ListaPacientesPage + RegistroPacienteModal

- [x] **2.1.1** Leer `lista-pacientes.page.ts`
- [x] **2.1.2** Leer `registro-paciente.modal.ts`
- [x] **2.1.3** Reemplazar `getPatologias()` / `getNecesidades()` en modal por `CacheCatalogoService`
- [x] **2.1.4** En `ListaPacientesPage.registrarPaciente()`: capturar error de red
- [x] **2.1.5** Si error de red: enqueue `CREATE_PATIENT` (con familiares incluidos en el body)
- [x] **2.1.6** Mostrar toast "Guardado en cola. Se sincronizará cuando haya conexión."
- [ ] **2.1.7** Navegar a la pantalla de detalle con datos locales (opcional) o volver a lista

#### Tarea 2.2 — DetallePacientePage + EditarPacienteModal

- [x] **2.2.1** Leer `detalle-paciente.page.ts`
- [x] **2.2.2** Leer `editar-paciente.modal.ts`
- [x] **2.2.3** Reemplazar `getPatologias()` / `getNecesidades()` en modal por `CacheCatalogoService`
- [x] **2.2.4** En `DetallePacientePage.editar()`: capturar error de red en `actualizarPaciente()`
- [x] **2.2.5** Si error de red: enqueue `UPDATE_PATIENT`
- [x] **2.2.6** Mostrar toast offline
- [x] **2.2.7** En `DetallePacientePage.eliminar()`: capturar error de red → enqueue `DELETE_PATIENT`
- [x] **2.2.8** En `cargar()` de DetallePaciente: si falla red, mostrar toast offline

#### Tarea 2.3 — ListaPacientesPage (eliminar/reactivar)

- [x] **2.3.1** En `eliminarPaciente()`: capturar error de red
- [x] **2.3.2** Si admin: enqueue `DELETE_PATIENT` (hard delete)
- [x] **2.3.3** Si no admin: enqueue `UPDATE_PATIENT` con `activo: false`
- [x] **2.3.4** En `reactivarPaciente()`: capturar error de red → enqueue `UPDATE_PATIENT` con `activo: true`
- [x] **2.3.5** Mostrar toast offline en ambos casos

---

### Fase 3 — Sincronización, Errores y UI ❌ PENDIENTE

> Robustez, manejo de conflictos y experiencia de usuario.

#### Tarea 3.1 — Procesamiento robusto de la cola

- [ ] **3.1.1** Manejar timeout en fetch() (30s por request)
- [ ] **3.1.2** Manejar HTTP 409 Conflict (duplicado): remover de cola silenciosamente
- [ ] **3.1.3** Manejar HTTP 4xx no recuperable: marcar como `failed` con mensaje
- [ ] **3.1.4** Manejar HTTP 5xx: incrementar retry, si excede límite marcar como `failed`
- [ ] **3.1.5** Procesar items en orden cronológico (FIFO por `createdAt`)
- [ ] **3.1.6** Items fallidos no bloquean el procesamiento de los siguientes
- [ ] **3.1.7** Emitir evento/resumen al completar el ciclo de sync

#### Tarea 3.2 — Indicador global de sincronización

- [ ] **3.2.1** Integrar `SyncIndicatorComponent` en el toolbar del `app.ts`
- [ ] **3.2.2** Mostrar contador de items pendientes con badge numérico
- [ ] **3.2.3** Al hacer clic: mostrar action sheet con opciones:
  - "Forzar sincronización ahora"
  - "Ver detalles de pendientes" (lista de items en cola)
  - "Cerrar"
- [ ] **3.2.4** Si hay items fallidos: mostrar opción para reintentarlos individualmente

#### Tarea 3.3 — Feedback al usuario

- [ ] **3.3.1** Toast warning con `cloud-upload-outline` al guardar en cola:
  "Guardado en cola. Se sincronizará cuando haya conexión."
- [ ] **3.3.2** Toast success al sincronizar exitosamente:
  "Registro sincronizado correctamente."
- [ ] **3.3.3** Toast danger si falla la sincronización definitivamente:
  "Error al sincronizar: [motivo]. Toque para reintentar."
- [ ] **3.3.4** Banner en páginas de lista cuando hay items pendientes relacionados:
  "Tienes N registros pendientes de sincronizar en esta carpa/paciente."

#### Tarea 3.4 — Manejo de errores de localStorage

- [ ] **3.4.1** Capturar `QuotaExceededError` (localStorage lleno)
- [ ] **3.4.2** Capturar error de Safari privado (localStorage no disponible)
- [ ] **3.4.3** En ambos casos: mostrar alerta al usuario y sugerir liberar espacio

#### Tarea 3.5 — Limpieza y mantenimiento

- [ ] **3.5.1** Al hacer logout: limpiar cola de sincronización pendiente
- [ ] **3.5.2** Al hacer login: procesar cola existente (heredada de sesión anterior)
- [ ] **3.5.3** Items con más de 7 días: marcar como `failed` (stale)

---

## 5. Archivos creados (4) ✅

| Archivo | Propósito |
|---|---|
| `apps/frontend/src/app/core/services/connectivity.service.ts` | Estado de conexión con señales |
| `apps/frontend/src/app/core/services/sync-queue.service.ts` | Cola de sincronización en localStorage |
| `apps/frontend/src/app/core/services/cache-catalogo.service.ts` | Cache de patologías y necesidades |
| `apps/frontend/src/app/shared/components/indicador-sync.component.ts` | Chip indicador en toolbar |

## 6. Archivos modificados (10) ✅

| Archivo | Cambios realizados |
|---|---|
| `apps/frontend/src/app/app.ts` | ✅ Agregado `IndicadorSyncComponent` + `IonButtons` en toolbar |
| `apps/frontend/src/app/app.html` | ✅ Agregado `<app-indicador-sync>` en slot end del header del menú |
| `apps/frontend/src/app/censo/pages/crear-carpa.page.ts` | ✅ Fallback a cola en error de red + toast warning |
| `apps/frontend/src/app/censo/modals/registrar-paciente-carpa.modal.ts` | ✅ CacheCatálogoService + items compuestos offline |
| `apps/frontend/src/app/censo/pages/listar-carpas.page.ts` | ✅ Fallback editar/eliminar carpa |
| `apps/frontend/src/app/censo/pages/detalle-carpa.page.ts` | ✅ Network error en carga + toast offline modal |
| `apps/frontend/src/app/pacientes/pages/lista-pacientes.page.ts` | ✅ Fallback register/delete/reactivar |
| `apps/frontend/src/app/pacientes/modals/registro-paciente.modal.ts` | ✅ CacheCatálogoService |
| `apps/frontend/src/app/pacientes/pages/detalle-paciente.page.ts` | ✅ Fallback editar/eliminar + network error en carga |
| `apps/frontend/src/app/pacientes/modals/editar-paciente.modal.ts` | ✅ CacheCatálogoService |
| `apps/frontend/src/app/shared/components/lista-necesidades-paciente/lista-necesidades-paciente.component.ts` | ✅ Fallback marcar suplida + toast offline |

---

## 7. Manejo de errores y conflictos

### 7.1 Error de red

```typescript
function isNetworkError(err: unknown): boolean {
  if (err instanceof HttpErrorResponse) {
    return err.status === 0; // Código 0 = error de red / timeout
  }
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return true; // fetch() falló
  }
  return !navigator.onLine;
}
```

### 7.2 Duplicado (HTTP 409)

Si al sincronizar un `CREATE_PATIENT` el backend responde con 409 (cédula o ID duplicado):
- Remover el item de la cola.
- No bloquear el resto de la sincronización.
- Registrar en consola para depuración.
- (Opcional) mostrar notificación al usuario en el próximo `ionViewWillEnter`.

### 7.3 Colisión de IDs de emergencia

Los IDs offline se generan con prefijo `OFF-{uuid-abreviado}` para minimizar colisiones.
Ejemplo: `OFF-a3f8-001`. El backend rechazará si ya existe, pero la probabilidad
es extremadamente baja.

---

## 8. Estimación de esfuerzo y estado real

| Fase | Tareas | Esfuerzo estimado | Estado |
|---|---|---|---|
| Fase 0: Infraestructura | 4 tareas (17 subtareas) | ~1 día | ✅ Completada |
| Fase 1: Offline Censo | 5 tareas (20 subtareas) | ~2 días | ✅ Completada (4 subtareas menores pendientes) |
| Fase 2: Offline Pacientes | 3 tareas (15 subtareas) | ~1.5 días | ✅ Completada (1 subtarea menor pendiente) |
| Fase 3: Sincronización y UI | 5 tareas (18 subtareas) | ~1.5 días | ❌ Pendiente |
| **Total** | **17 tareas (~70 subtareas)** | **~6 días** | **~70% completado** |

---

## 9. Dependencias

```
ConnectivityService  ←  SyncQueueService  ←  SyncIndicatorComponent
                          ↕
                     CacheCatalogoService
                          ↕
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
  Páginas Censo                       Páginas Pacientes
  (Fase 1)                            (Fase 2)
```

Se recomienda implementar en orden de fases: la Fase 0 es prerrequisito para todo lo demás.
Las Fases 1 y 2 son independientes entre sí y pueden hacerse en paralelo.

---

## 10. Notas adicionales

- **No requiere cambios en el backend**: todos los endpoints existentes se usan tal cual.
- **No requiere nuevas dependencias npm**: localStorage, fetch(), uuid (implementación
  manual con `crypto.randomUUID()` disponible en todos los navegadores modernos).
- **La cola persiste entre sesiones**: si el usuario cierra el navegador y vuelve, los
  items pendientes siguen ahí y se procesan al reconectar.
- **El indicador global usa `ion-chip`**: consistente con el design system del proyecto.
- **Los items compuestos** (CREATE_PATIENT + ADD_MEMBER_CARPA) se almacenan como 2 items
  separados pero vinculados por un `tempId`. `SyncQueueService` es responsable de resolver
  la dependencia al procesar.
