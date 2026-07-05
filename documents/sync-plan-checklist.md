# Plan de Sincronización Multi-Usuario — Checklist

> **Propósito**: Garantizar que todos los usuarios de la red local vean datos actualizados en
tiempo real, independientemente de quién realice cambios desde otro dispositivo.
>
> **Contexto**: 3+ usuarios en celulares distintos, misma red local. Stock, lotes y recetas
cambian constantemente por acciones de otros usuarios.
>
> **Estrategia**: `ionViewWillEnter` (refetch en navegación) + polling automático
(páginas críticas) + pull-to-refresh (opción manual) + refetch real post-mutación.

---

## Fase 1 — `ionViewWillEnter` en páginas críticas

**Objetivo**: Cada vez que se navega a una página (menú lateral, botón atrás, etc.),
los datos se refetchan del servidor. Ionic cachea páginas en `<ion-router-outlet>`,
por eso `ngOnInit` no se repite — `ionViewWillEnter` sí.

### Instrucción general para cada página:

1. Importar `ViewWillEnter` desde `@ionic/angular/standalone`.
2. En `implements`, reemplazar `OnInit` por `ViewWillEnter` (o agregar ambos si se requiere OnInit).
3. Crear método `ionViewWillEnter(): void` con las llamadas de carga.
4. Si había un método `reintentarCarga()`, mantenerlo (se usa desde botón de error y pull-to-refresh).

---

### Tarea 1.1 — DashboardIngresosPage (`recepcion/pages/dashboard-ingresos.page.ts`)

- [x] **1.1.1** Agregar `ViewWillEnter` al import de `@ionic/angular/standalone`.
- [x] **1.1.2** Cambiar `implements OnInit` → `implements ViewWillEnter`.
- [x] **1.1.3** Mover el contenido de `ngOnInit()` a un nuevo método `ionViewWillEnter()`.
- [x] **1.1.4** Eliminar `OnInit` del import (si ya no se usa en el archivo).
- [x] **1.1.5** Verificar que `reintentarCarga()` sigue funcionando (llama a `cargarLotes()`).

### Tarea 1.2 — PanelStockPage (`inventario/pages/panel-stock.page.ts`)

- [x] **1.2.1** Agregar `ViewWillEnter` al import.
- [x] **1.2.2** Cambiar `implements OnInit` → `implements ViewWillEnter`.
- [x] **1.2.3** Renombrar o mover el contenido de `ngOnInit()` a `ionViewWillEnter()`.
- [x] **1.2.4** Eliminar `OnInit` del import (si ya no se usa).

### Tarea 1.3 — ConfigurarUmbralesPage (`inventario/pages/configurar-umbrales.page.ts`)

- [x] **1.3.1** Agregar `ViewWillEnter` al import.
- [x] **1.3.2** Cambiar `implements OnInit` → `implements ViewWillEnter`.
- [x] **1.3.3** Mover `ngOnInit()` → `ionViewWillEnter()`.
- [x] **1.3.4** Eliminar `OnInit` del import.

### Tarea 1.4 — GestionUsuariosPage (`administracion/pages/gestion-usuarios.page.ts`)

- [x] **1.4.1** Agregar `ViewWillEnter` al import.
- [x] **1.4.2** Cambiar `implements OnInit` → `implements ViewWillEnter`.
- [x] **1.4.3** Mover `ngOnInit()` → `ionViewWillEnter()`.
- [x] **1.4.4** Eliminar `OnInit` del import.

### Tarea 1.5 — ConfiguracionGeneralPage (`administracion/pages/configuracion-general.page.ts`)

- [x] **1.5.1** Agregar `ViewWillEnter` al import.
- [x] **1.5.2** Cambiar `implements OnInit` → `implements ViewWillEnter`.
- [x] **1.5.3** Mover `ngOnInit()` → `ionViewWillEnter()`.
- [x] **1.5.4** Eliminar `OnInit` del import.

### Tarea 1.6 — RecetarPage (`recetas/pages/recetar.page.ts`) [Especial]

**Nota**: RecetarPage necesita CONSERVAR `OnInit` para restaurar borrador y cargar query params.
Se AGREGA `ViewWillEnter` adicionalmente.

- [x] **1.6.1** Agregar `ViewWillEnter` al import (conservar `OnInit`).
- [x] **1.6.2** Agregar `ViewWillEnter` y `ViewWillLeave` al `implements`.
- [x] **1.6.3** Crear `ionViewWillEnter(): void` que llame a `cargarMedicamentosEnStock()` e `iniciarPollingStock()` solo si `paso() >= 2`.
- [x] **1.6.4** Verificar que `ngOnInit` conserva su lógica actual (restaurarBorrador + queryParam + condicional stock).

---

## Fase 2 — Eliminar cache guards y refetch real post-mutación

**Objetivo**: Cada mutación (crear/editar/eliminar) hace un refetch completo del servidor,
no solo manipula estado local. Esto asegura consistencia con lo que otros usuarios han cambiado.

### Tarea 2.1 — Eliminar cache guard en RecetarPage

- [x] **2.1.1** En `recetas/pages/recetar.page.ts`, ubicar método `cargarMedicamentosEnStock()`.
- [x] **2.1.2** Eliminar las líneas del cache guard.
- [x] **2.1.3** Verificar que el resto del método queda intacto (cargando.set(true), llamada HTTP, etc.).

### Tarea 2.2 — Refetch completo tras crear lote en DashboardIngresosPage

- [x] **2.2.1** En `recepcion/pages/dashboard-ingresos.page.ts`, ubicar `abrirIngresoLote()`.
- [x] **2.2.2** Reemplazar `this.lotes.update(list => [lote, ...list])` por `this.cargarLotes()`.
- [x] **2.2.3** Verificar que `this.cargarMedicamentos()` se mantiene.
- [x] **2.2.4** Verificar que `this.abrirImprimirEtiqueta(lote)` se mantiene.

### Tarea 2.3 — Refetch completo tras editar umbral

- [x] **2.3.1** En `inventario/pages/configurar-umbrales.page.ts`, ubicar `editarUmbral()`.
- [x] **2.3.2** Reemplazar manipulación local por `this.cargarUmbrales()`.

---

## Fase 3 — Polling automático en páginas críticas

**Objetivo**: Mientras el usuario permanece en la página, los datos se refrescan solos
cada N segundos. La recarga es **silenciosa** (no muestra spinner, no interrumpe la UI).

### Patrón general de polling

```typescript
import { interval, Subscription } from 'rxjs';
import { ViewWillEnter, ViewWillLeave } from '@ionic/angular/standalone';

export class MiPage implements ViewWillEnter, ViewWillLeave {
  private pollingSub?: Subscription;

  ionViewWillEnter() {
    this.cargarDatos();
    this.iniciarPolling();
  }

  ionViewWillLeave() {
    this.detenerPolling();
  }

  private iniciarPolling(): void {
    this.pollingSub = interval(INTERVALO_MS).subscribe(() =>
      this.refrescarSilencioso()
    );
  }

  private detenerPolling(): void {
    this.pollingSub?.unsubscribe();
  }

  private refrescarSilencioso(): void {
    // Implementación específica de cada página
    // SIN cargando.set(true) / cargando.set(false)
    // Error: silencioso, no mostrar toast al usuario
  }
}
```

### Tarea 3.1 — Polling en PanelStockPage (cada 20s)

- [x] **3.1.1** Importar `ViewWillLeave` desde `@ionic/angular/standalone`.
- [x] **3.1.2** Importar `interval`, `Subscription` desde `rxjs`.
- [x] **3.1.3** Agregar `ViewWillLeave` al `implements`.
- [x] **3.1.4** Agregar propiedad privada `pollingSub?: Subscription`.
- [x] **3.1.5** Agregar método `private iniciarPolling(): void` con `interval(20000)`.
- [x] **3.1.6** Agregar método `private detenerPolling(): void` con `unsubscribe()`.
- [x] **3.1.7** Agregar método `private refrescarSilencioso(): void` (stock + lotesCache + alerta vitales).
- [x] **3.1.8** En `ionViewWillEnter()`, agregar `this.iniciarPolling()` después de `cargarDatos()`.
- [x] **3.1.9** Crear `ionViewWillLeave()` con `this.detenerPolling()`.

### Tarea 3.2 — Polling en DashboardIngresosPage (cada 30s)

- [x] **3.2.1** Importar `ViewWillLeave` desde `@ionic/angular/standalone`.
- [x] **3.2.2** Importar `interval`, `Subscription` desde `rxjs`.
- [x] **3.2.3** Agregar `ViewWillLeave` al `implements`.
- [x] **3.2.4** Agregar propiedad `pollingSub?: Subscription`.
- [x] **3.2.5** Agregar `iniciarPolling()` con `interval(30000)`.
- [x] **3.2.6** Agregar `detenerPolling()` con `unsubscribe()`.
- [x] **3.2.7** Agregar `refrescarSilencioso(): void` (refetch lotes + refilter).
- [x] **3.2.8** En `ionViewWillEnter()`, agregar `this.iniciarPolling()`.
- [x] **3.2.9** Crear `ionViewWillLeave()` con `this.detenerPolling()`.

### Tarea 3.3 — Polling de stock en RecetarPage (cada 20s, solo stock)

**Nota**: Este polling NO debe interrumpir el formulario.

- [x] **3.3.1** Importar `ViewWillLeave` desde `@ionic/angular/standalone`.
- [x] **3.3.2** Importar `interval`, `Subscription` desde `rxjs`.
- [x] **3.3.3** Agregar `ViewWillLeave` al `implements`.
- [x] **3.3.4** Agregar propiedad `pollingSub?: Subscription`.
- [x] **3.3.5** Agregar método `private iniciarPollingStock(): void` con `interval(20000)`.
- [x] **3.3.6** Agregar método `private detenerPolling(): void` con `unsubscribe()`.
- [x] **3.3.7** Agregar método `private refrescarStockSilencioso(): void`.
- [x] **3.3.8** En `ionViewWillEnter()`, agregar `this.iniciarPollingStock()` si `paso() >= 2`.
- [x] **3.3.9** Crear `ionViewWillLeave()` con `this.detenerPolling()`.

---

## Fase 4 — Pull-to-refresh

**Objetivo**: El usuario puede forzar recarga manual con gesto de "tirar hacia abajo"
en cualquier momento.

### Patrón general de pull-to-refresh

```typescript
import { IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

// En imports del @Component:
imports: [..., IonRefresher, IonRefresherContent]

// En template, dentro de <ion-content> (como primer hijo):
<ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
  <ion-refresher-content></ion-refresher-content>
</ion-refresher>

// Método en la clase:
async handleRefresh(event: CustomEvent): Promise<void> {
  await firstValueFrom(this.servicio.metodo());
  (event.target as HTMLIonRefresherElement).complete();
}
```

### Tarea 4.1 — Pull-to-refresh en DashboardIngresosPage

- [x] **4.1.1** Importar `IonRefresher`, `IonRefresherContent` desde `@ionic/angular/standalone`.
- [x] **4.1.2** Agregar ambos al array `imports` del `@Component`.
- [x] **4.1.3** Agregar `<ion-refresher>` en template, dentro de `<ion-content>`.
- [x] **4.1.4** Agregar método `handleRefresh()`.

### Tarea 4.2 — Pull-to-refresh en PanelStockPage

- [x] **4.2.1** Importar `IonRefresher`, `IonRefresherContent`.
- [x] **4.2.2** Agregar al array `imports`.
- [x] **4.2.3** Agregar `<ion-refresher>` en template.
- [x] **4.2.4** Agregar método `handleRefresh()`.

### Tarea 4.3 — Pull-to-refresh en GestionUsuariosPage

- [x] **4.3.1** Importar `IonRefresher`, `IonRefresherContent`.
- [x] **4.3.2** Agregar al array `imports`.
- [x] **4.3.3** Agregar `<ion-refresher>` en template.
- [x] **4.3.4** Agregar método `handleRefresh()`.

### Tarea 4.4 — Pull-to-refresh en ConfigurarUmbralesPage

- [x] **4.4.1** Importar `IonRefresher`, `IonRefresherContent`.
- [x] **4.4.2** Agregar al array `imports`.
- [x] **4.4.3** Agregar `<ion-refresher>` en template.
- [x] **4.4.4** Agregar método `handleRefresh()`.

### Tarea 4.5 — Pull-to-refresh en ConfiguracionGeneralPage

- [x] **4.5.1** Importar `IonRefresher`, `IonRefresherContent`.
- [x] **4.5.2** Agregar al array `imports`.
- [x] **4.5.3** Agregar `<ion-refresher>` en template.
- [x] **4.5.4** Agregar método `handleRefresh()`.

---

## Fase 5 — Verificación y pruebas

### Tarea 5.1 — Build

- [x] **5.1.1** Ejecutar `npx nx build frontend --configuration=development` ✅.
- [x] **5.1.2** Sin errores de compilación.
- [x] **5.1.3** Ejecutar `npx nx lint frontend` ✅ (solo warnings pre-existentes).
- [x] **5.1.4** Sin errores nuevos de lint.

### Tarea 5.2 — Prueba multi-dispositivo (pendiente — requiere servidor)

- [ ] **5.2.1** Servir la app: `npx nx serve frontend`.
- [ ] **5.2.2** Abrir 2 ventanas/2 dispositivos apuntando a la misma URL.
- [ ] **5.2.3** Login simultáneo con usuarios de distintos roles.
- [ ] **5.2.4** Usuario A registra un lote en Recepción.
- [ ] **5.2.5** Usuario B verifica que el lote aparece en Inventario (≤30s por polling).
- [ ] **5.2.6** Usuario C dispensa un medicamento.
- [ ] **5.2.7** Usuario B verifica que el stock se actualiza en RecetarPage (≤20s).
- [ ] **5.2.8** Usuario B usa pull-to-refresh en stock y confirma que los datos coinciden.

### Tarea 5.3 — Verificar detención de polling

- [ ] **5.3.1** Navegar a PanelStockPage → se inicia polling (interval 20s).
- [ ] **5.3.2** Navegar a otra página → polling se detiene (`ionViewWillLeave`).
- [ ] **5.3.3** Volver a PanelStockPage → polling se re-inicia.
- [ ] **5.3.4** Verificar en DevTools (Network tab) que no hay calls HTTP después de salir.

### Tarea 5.4 — Verificar RecetarPage

- [ ] **5.4.1** Iniciar una receta (seleccionar paciente, agregar medicamentos).
- [ ] **5.4.2** Navegar al menú y volver (sin recargar).
- [ ] **5.4.3** Verificar que el paciente y medicamentos seleccionados se conservan.
- [ ] **5.4.4** Verificar que los números de stock se actualizaron (polling).
- [ ] **5.4.5** Guardar la receta → confirmar que funciona correctamente.

### Tarea 5.5 — Verificar pantallas de administración

- [ ] **5.5.1** Navegar a Usuarios → crear un usuario.
- [ ] **5.5.2** Navegar a otra página y volver → verificar que el usuario aparece.
- [ ] **5.5.3** Navegar a Umbrales → editar un umbral → navegar y volver → verificar cambio.

---

## Resumen de archivos a modificar

| Archivo | F1 | F2 | F3 | F4 |
|---|---|---|---|---|
| `recepcion/pages/dashboard-ingresos.page.ts` | ✅ | ✅ | ✅ (30s) | ✅ |
| `inventario/pages/panel-stock.page.ts` | ✅ | — | ✅ (20s) | ✅ |
| `inventario/pages/configurar-umbrales.page.ts` | ✅ | ✅ | — | ✅ |
| `recetas/pages/recetar.page.ts` | ✅ (especial) | ✅ | ✅ (20s, stock) | — |
| `administracion/pages/gestion-usuarios.page.ts` | ✅ | — | — | ✅ |
| `administracion/pages/configuracion-general.page.ts` | ✅ | — | — | ✅ |

**Total**: 6 archivos, ~70 subtareas en 5 fases.

---

## Notas importantes

### Sobre el polling
- El polling usa `interval()` de RxJS, se cancela automáticamente al salir de la página.
- Las suscripciones de polling **no** muestran loading spinners ni errores al usuario.
- Si una petición de polling falla, el error se ignora silenciosamente (el siguiente intervalo lo reintentará).
- El polling en `RecetarPage` **nunca** resetea el formulario (paciente, carrito, paso actual).

### Sobre `ionViewWillEnter` vs `ngOnInit`
| Lifecycle | ¿Cuándo se ejecuta? |
|---|---|
| `constructor` | Una vez, al crear la instancia del componente |
| `ngOnInit` | Una vez, después del primer cambio de detección |
| `ionViewWillEnter` | **Cada vez** que la página se muestra (incluso desde caché) |
| `ionViewWillLeave` | **Cada vez** que la página se oculta |

### Sobre el refetch silencioso en DashboardIngresosPage
Cuando polling refresca `lotes`, el filtro `filtrarLotes()` se aplica automáticamente.
Si el usuario tiene un término de búsqueda escrito, los resultados filtrados se actualizan
sin perder el término de búsqueda.

### Sobre múltiples usuarios en red local
- No requiere WebSocket ni SSE. El polling HTTP es suficiente para la red local.
- El intervalo de 20s en stock y recetas asegura que ningún dato crítico tenga más de 20s de desactualización.
- En redes locales, cada petición HTTP toma <100ms, por lo que el polling no afecta el rendimiento.
