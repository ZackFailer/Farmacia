# Sistema de Diseño — ApoPharma Frontend

> **Propósito**: Guía vinculante para la creación y modificación de cualquier componente, página, modal o formulario del frontend. Debe ser consultada siempre antes de implementar cambios en `apps/frontend/`.

---

## 1. Principios de Diseño

| Principio | Aplicación |
|---|---|
| **Mobile-first** | Toda interfaz se diseña primero para pantallas táctiles de 320px-768px. Soporte hasta 1920px. |
| **Alto contraste** | Texto sobre fondo siempre con relación de contraste ≥ 4.5:1. |
| **Claridad > Estética** | Contexto de emergencia: la información crítica debe leerse de un vistazo. Sin decoración innecesaria. |
| **Consistencia** | Mismos patrones de interacción en toda la app. Modales, formularios, listas y barras siguen exactamente las mismas reglas. |
| **Táctil** | Todos los elementos interactivos tienen `min-height: 48px` y área de toque ≥ 44x44px. |

---

## 2. Paleta de Colores

### Colores Base

```scss
:root {
  // Primarios
  --app-primary: #1a5276;           // Azul humanitario (headers, botones primarios, enlaces)
  --app-primary-dark: #0e2f44;      // Hover/active variants
  --app-primary-light: #2980b9;

  // Neutros
  --app-bg: #f4f5f7;                // Fondo de pantalla
  --app-surface: #ffffff;           // Fondo de tarjetas, modales, inputs
  --app-text: #1a1a2e;              // Texto principal
  --app-text-secondary: #5a5a7a;     // Texto secundario (labels, hint)
  --app-border: #d1d5db;            // Bordes de inputs, cards, separadores
  --app-divider: #e5e7eb;           // Divisores finos

  // Semáforo de Stock (usar exclusivamente para inventario)
  --stock-ok: #28a745;
  --stock-bajo: #ffc107;
  --stock-agotado: #dc3545;
  --stock-ok-bg: #e8f5e9;
  --stock-bajo-bg: #fff8e1;
  --stock-agotado-bg: #ffebee;

  // Feedback
  --app-success: #28a745;
  --app-warning: #ffc107;
  --app-warning-bg: #fff3cd;
  --app-error: #dc3545;
  --app-error-bg: #ffebee;
  --app-info: #17a2b8;
}
```

### Reglas de uso

| Color | Dónde usarlo | Dónde NO usarlo |
|---|---|---|
| `--app-primary` | Headers `ion-toolbar`, botones primarios, enlaces, indicadores activos | Fondos de página completos, texto sobre fondo primary |
| `--stock-*` | Exclusivamente en `IndicadorStockComponent` y panel de inventario | Botones, headers, formularios |
| `--app-warning-bg` | Alertas de vencimiento, stock bajo, notificaciones | Fondos de página |
| `--app-error-bg` | Errores de validación, stock agotado | Uso general |

---

## 3. Tipografía

```scss
:root {
  --app-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --app-font-size-xs: 0.75rem;    // 12px - etiquetas, metadatos
  --app-font-size-sm: 0.875rem;   // 14px - cuerpo secundario
  --app-font-size-md: 1rem;       // 16px - cuerpo principal (base)
  --app-font-size-lg: 1.125rem;   // 18px - subtítulos
  --app-font-size-xl: 1.25rem;    // 20px - títulos de página
  --app-font-size-2xl: 1.5rem;    // 24px - títulos de sección
  --app-font-size-3xl: 2rem;      // 32px - solo para login/logo
}
```

| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Título de página (`ion-title`) | `--app-font-size-xl` | 700 | `--app-text` |
| Subtítulo de sección | `--app-font-size-lg` | 600 | `--app-text` |
| Cuerpo principal | `--app-font-size-md` | 400 | `--app-text` |
| Texto secundario (labels, hints) | `--app-font-size-sm` | 400 | `--app-text-secondary` |
| Metadatos (fechas, códigos) | `--app-font-size-xs` | 400 | `--app-text-secondary` |
| Botones | `--app-font-size-md` | 600 | — |
| Input labels | `--app-font-size-sm` | 500 | `--app-text-secondary` |
| Indicador de paso | `--app-font-size-xs` | 600 | `--app-primary` |

---

## 4. Espaciado y Layout

```scss
:root {
  --app-space-xs: 4px;
  --app-space-sm: 8px;
  --app-space-md: 12px;
  --app-space-lg: 16px;
  --app-space-xl: 24px;
  --app-space-2xl: 32px;

  --app-radius-sm: 6px;      // Inputs, chips
  --app-radius-md: 10px;     // Cards, modales
  --app-radius-lg: 16px;     // Modales full-width

  --app-header-height: 56px;
}
```

### Reglas de Layout

| Componente | Padding horizontal | Padding vertical | Border radius |
|---|---|---|---|
| `ion-content` | `--app-space-lg` (16px) | — | — |
| Cards de lista | `--app-space-lg` | `--app-space-md` (12px) | `--app-radius-md` |
| Modales | `--app-space-xl` (24px) | `--app-space-xl` | `--app-radius-lg` (top) |
| Input fields | `--app-space-md` (12px) | `--app-space-sm` (8px) | `--app-radius-sm` |
| Botones | `--app-space-xl` (24px) | `--app-space-md` (12px) | `--app-radius-sm` |

---

## 5. Patrones de Componentes

### 5.1 Páginas (`*.page.ts`)

Todas las páginas siguen esta estructura:

```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/"></ion-back-button>
    </ion-buttons>
    <ion-title>{Nombre Página}</ion-title>
    <ion-buttons slot="end">
      <!-- Acciones opcionales: FAB alternativo, filtros -->
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <!-- Contenido de la página -->
</ion-content>
```

**Reglas**:
- Siempre usar `color="primary"` en `ion-toolbar` (hereda `--app-primary`).
- `ion-back-button` siempre presente excepto en `/login`.
- El título en `ion-title` debe ser corto (1-3 palabras).
- Paginación: usar `ion-infinite-scroll` para scroll infinito en listas largas.

### 5.2 Modales

```html
<ion-header>
  <ion-toolbar>
    <ion-title>{Título Modal}</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">
        <ion-icon name="close-outline"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <!-- Contenido del modal -->
</ion-content>

<ion-footer>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-button fill="clear" color="medium" (click)="dismiss()">
        Cancelar
      </ion-button>
    </ion-buttons>
    <ion-buttons slot="end">
      <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!form.valid">
        Guardar
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-footer>
```

**Reglas**:
- Header: `ion-toolbar` **sin** `color="primary"` (usar default translúcido de Ionic). 
- Botón de cerrar (X) siempre presente en slot end del header.
- Footer con dos botones: Cancelar (clear) a la izquierda, acción principal (solid) a la derecha.
- El botón de acción principal se deshabilita si el formulario no es válido.
- Para modales de solo lectura/visualización: solo botón "Cerrar" centrado en el footer.
- Para modales de alerta/confirmación: botón "Cancelar" (clear) + "Continuar" (solid) o "Eliminar" (danger).

### 5.3 Formularios

```html
<form [formGroup]="form" (ngSubmit)="guardar()">
  <ion-item>
    <ion-label position="stacked">Nombre del campo *</ion-label>
    <ion-input formControlName="campo" type="text"></ion-input>
    <ion-note slot="error" *ngIf="form.get('campo')?.invalid && form.get('campo')?.touched">
      Mensaje de error
    </ion-note>
  </ion-item>
</form>
```

**Reglas**:
- `position="stacked"` para todos los labels (nunca usar `floating` ni `fixed`).
- Labels con asterisco (*) para campos obligatorios.
- Mensajes de error con `ion-note slot="error"` solo cuando el campo ha sido tocado.
- Inputs numéricos usar `type="number"` con `min`/`max` cuando aplique.
- `ion-select` para opciones cerradas (roles, categorías).
- Toggle (`ion-toggle`) para booleanos (ej: "¿Es damnificado?").
- Validación visual: IonInput ya aplica clase `ion-invalid` automáticamente.
- Autocompletado: implementar con `ion-searchbar` + debounce de 300ms + lista de resultados debajo.

### 5.4 Listas (Cards de items)

```html
<ion-list>
  <ion-item button *ngFor="let item of items" (click)="seleccionar(item)">
    <ion-label>
      <h2>{{ item.nombre }}</h2>
      <p>{{ item.subtitulo }}</p>
      <ion-note>{{ item.metadato }}</ion-note>
    </ion-label>
    <app-indicador-stock slot="end" [cantidad]="item.stock" [umbral]="item.umbral"></app-indicador-stock>
    <ion-button slot="end" fill="clear" (click)="accion($event, item)">
      <ion-icon name="ellipsis-vertical-outline"></ion-icon>
    </ion-button>
  </ion-item>
</ion-list>
```

**Reglas**:
- `ion-item button` para items cliqueables (navegación, selección).
- `<h2>` para nombre del item, `<p>` para subtítulo/detalle, `<ion-note>` para metadatos.
- Acciones contextuales: usar `ion-button fill="clear"` con icono, nunca botones de texto inline.
- Evitar `ion-card` dentro de listas; usar `ion-item` que ya provee el estilo de card nativo de Ionic.

### 5.5 Autocompletado (Buscador)

```html
<ion-searchbar
  [formControl]="searchControl"
  placeholder="Buscar medicamento..."
  debounce="300"
  (ionInput)="onSearch($event)"
></ion-searchbar>

@if (resultados.length > 0) {
  <ion-list>
    <ion-item button *ngFor="let r of resultados" (click)="seleccionar(r)">
      <ion-label>{{ r.nombre }}</ion-label>
    </ion-item>
  </ion-list>
}
```

**Reglas**:
- `ion-searchbar` con `debounce="300"`.
- Controlar con `FormControl` (ReactiveForms).
- Mostrar resultados en `ion-list` justo debajo.
- Al seleccionar: limpiar búsqueda y ocultar resultados.

---

## 6. Patrón de Navegación

### 6.1 Header con barra de progreso (Flujo de 3 pasos — Dispensación)

```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/dispensacion/paso1"></ion-back-button>
    </ion-buttons>
    <ion-title>Paso {{ paso }}/3</ion-title>
  </ion-toolbar>
  <ion-progress-bar [value]="paso / 3" color="light"></ion-progress-bar>
</ion-header>
```

### 6.2 FAB (Botón de acción flotante)

```html
<ion-fab vertical="bottom" horizontal="end" slot="fixed">
  <ion-fab-button color="primary" (click)="abrirModal()">
    <ion-icon name="add-outline"></ion-icon>
  </ion-fab-button>
</ion-fab>
```

**Reglas**:
- Solo un FAB por página.
- Usar `add-outline` para crear, `scan-outline` para escanear.
- Posición: `bottom` + `end` (esquina inferior derecha).

---

## 7. Patrón de Indicador de Stock (Semáforo)

### Componente: `IndicadorStockComponent`

| Estado | Condición | Color | Texto | Icono |
|---|---|---|---|---|
| OK | `cantidad > umbral * 2` | `--stock-ok` | "Normal" | `checkmark-circle` |
| Bajo | `cantidad > 0 && cantidad <= umbral` | `--stock-bajo` | "Bajo" | `alert-circle` |
| Agotado | `cantidad === 0` | `--stock-agotado` | "Agotado" | `close-circle` |

```html
<ion-chip [color]="colorClass" [outline]="true">
  <ion-icon [name]="iconName"></ion-icon>
  <ion-label>{{ texto }}</ion-label>
</ion-chip>
```

---

## 8. Patrón de QR Scanner

### Componente compartido: `EscanerQrComponent`

```html
<div class="escaner-container" #scannerContainer>
  @if (!camaraActiva) {
    <div class="escaner-placeholder" (click)="iniciarEscaneo()">
      <ion-icon name="scan-outline" class="escaner-icon"></ion-icon>
      <p>Toca para escanear</p>
    </div>
  }
  <video #videoElement class="escaner-video" [hidden]="!camaraActiva"></video>
</div>
```

**Reglas**:
- Placeholder con icono grande `scan-outline` antes de activar.
- Al activar, mostrar video en contenedor con aspect-ratio 1:1.
- Emitir evento `(codigoEscaneado)` con el string del QR.
- Botón para cancelar/detener escaneo.

---

## 9. Patrón de Tarjetas de Medicamento

```html
<ion-item button class="med-card" [class.stock-bajo]="esBajo" [class.stock-agotado]="esAgotado">
  <ion-label>
    <h2>{{ medicamento.nombre_generico }} {{ medicamento.concentracion }}</h2>
    <p>{{ medicamento.presentacion }}</p>
    <ion-note>Stock: {{ stockTotal }} unds · Vence: {{ proximoVencer }}</ion-note>
  </ion-label>
  <app-indicador-stock slot="end" [cantidad]="stockTotal" [umbral]="umbral"></app-indicador-stock>
</ion-item>
```

- Borde izquierdo con color: `3px solid var(--stock-ok|bajo|agotado)` según estado.

---

## 10. Estados de Carga y Vacío

### Loading state

```html
@if (cargando) {
  <div class="app-loading">
    <ion-spinner name="crescent"></ion-spinner>
    <p>Cargando...</p>
  </div>
}
```

### Empty state

```html
@if (!cargando && items.length === 0) {
  <div class="app-empty">
    <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
    <h3>Sin resultados</h3>
    <p>{{ mensajeVacio }}</p>
  </div>
}
```

### Error state

```html
@if (error) {
  <div class="app-error-state">
    <ion-icon name="cloud-offline-outline"></ion-icon>
    <p>{{ mensajeError }}</p>
    <ion-button fill="outline" (click)="reintentar()">Reintentar</ion-button>
  </div>
}
```

### Estilos globales para estados:

```scss
.app-loading, .app-empty, .app-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--app-space-2xl);
  text-align: center;
  min-height: 200px;
  color: var(--app-text-secondary);
}

.app-empty-icon {
  font-size: 64px;
  margin-bottom: var(--app-space-lg);
  color: var(--app-border);
}
```

---

## 11. Estilos Globales (styles.scss)

```scss
// Design System Tokens
:root {
  --app-primary: #1a5276;
  --app-primary-dark: #0e2f44;
  --app-primary-light: #2980b9;
  --app-bg: #f4f5f7;
  --app-surface: #ffffff;
  --app-text: #1a1a2e;
  --app-text-secondary: #5a5a7a;
  --app-border: #d1d5db;
  --app-divider: #e5e7eb;
  --stock-ok: #28a745;
  --stock-bajo: #ffc107;
  --stock-agotado: #dc3545;
  --stock-ok-bg: #e8f5e9;
  --stock-bajo-bg: #fff8e1;
  --stock-agotado-bg: #ffebee;
  --app-success: #28a745;
  --app-warning: #ffc107;
  --app-warning-bg: #fff3cd;
  --app-error: #dc3545;
  --app-error-bg: #ffebee;
  --app-info: #17a2b8;
  --app-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --app-space-xs: 4px;
  --app-space-sm: 8px;
  --app-space-md: 12px;
  --app-space-lg: 16px;
  --app-space-xl: 24px;
  --app-space-2xl: 32px;
  --app-radius-sm: 6px;
  --app-radius-md: 10px;
  --app-radius-lg: 16px;
}

// Forzar botones táctiles tamaño mínimo
ion-button, ion-fab-button, ion-item button {
  --min-height: 48px;
}

// Consistencia en inputs
ion-item {
  --border-radius: var(--app-radius-sm);
  --padding-start: var(--app-space-md);
  --padding-end: var(--app-space-md);
  margin-bottom: var(--app-space-md);
}

// Tipografía base
* {
  font-family: var(--app-font-family);
}
```

---

## 12. Convenciones de Código

### Nomenclatura de archivos
- Páginas: `{nombre}.page.ts`
- Modales: `{nombre}.modal.ts`
- Servicios: `{nombre}.service.ts`
- Componentes: `{nombre}.component.ts`
- Guards: `{nombre}.guard.ts`
- Modelos/Interfaces: `{nombre}.model.ts`
- Rutas: `{modulo}.routes.ts`

### Nomenclatura en templates HTML
- Eventos: siempre en español en bindings de template (ej: `(click)="guardar()"`, `(ionInput)="buscar()"`).
- Variables y métodos en TypeScript: inglés (`onSearch()`, `save()`, `getLotes()`).

### Señales (Signals)
- Servicios de estado: usar `signal()` e `input()`.
- No usar `BehaviorSubject` a menos que sea necesario para streams asíncronos.
- Estado compartido entre pasos (dispensación): almacenar en servicio con `signal()`.

### Formularios
- Usar siempre `ReactiveFormsModule` (nunca template-driven forms).
- `FormGroup` tipado opcionalmente con interfaz.
- Validar en TypeScript + HTML (mensajes de error).

---

## 13. Responsividad

| Breakpoint | Target | Comportamiento |
|---|---|---|
| 320px - 768px | Teléfonos | Diseño principal. Full-width modales. |
| 768px - 1024px | Tablets | Cards en grid de 2 columnas. Modales con max-width 600px. |
| 1024px - 1920px | Desktop | Sidebar de navegación (futuro). Grid de 3+ columnas. Modales con max-width 600px. |

**Todas las páginas deben funcionar correctamente en 320px sin scroll horizontal.**

---

## 14. Resumen de Componentes Compartidos (shared/)

| Componente | Propósito | Inputs | Outputs |
|---|---|---|---|
| `EscanerQrComponent` | Escáner QR con cámara | — | `codigoEscaneado: string` |
| `BuscadorComponent` | Input + lista filtrable | `items: any[]`, `placeholder: string` | `seleccionado: any` |
| `IndicadorStockComponent` | Semáforo de colores | `cantidad: number`, `umbral: number` | — |
| `EncabezadoPasoComponent` | Barra de progreso (paso X/3) | `paso: number`, `totalPasos: number` | — |

---

## 15. Mapa de Rutas y Modales (Referencia Rápida)

| Ruta | Página | Modales asociados |
|---|---|---|
| `/login` | `LoginPage` | RecuperarPinModal |
| `/recepcion` | `DashboardIngresosPage` | IngresoLoteModal, NuevoMedicamentoModal, ImprimirEtiquetaModal |
| `/inventario` | `PanelStockPage` | AjusteStockModal, DetalleLoteModal, AlertaStockModal |
| `/inventario/umbrales` | `ConfigurarUmbralesPage` | EditarUmbralModal |
| `/dispensacion/paso1` | `Paso1EscanearPacientePage` | RegistroPacienteModal, BusquedaPacienteModal |
| `/dispensacion/paso2` | `Paso2SeleccionarMedsPage` | BusquedaMedicamentoModal |
| `/dispensacion/paso3` | `Paso3ConfirmarPage` | ValidacionDosisModal, ConfirmacionEntregaModal |
| `/historial/:pacienteId` | `HistorialPacientePage` | DetalleDispensacionModal |
| `/admin/usuarios` | `GestionUsuariosPage` | CrearEditarUsuarioModal |
| `/admin/configuracion` | `ConfiguracionGeneralPage` | LimitesDosisModal |

---

## 16. Checklist de Verificación

Antes de dar por terminado cualquier componente nuevo o modificación, verificar:

- [ ] Sigue la estructura de página/modal definida en la sección 5.
- [ ] Usa variables CSS del design system (no colores hardcodeados).
- [ ] Botones con `min-height: 48px`.
- [ ] Labels con `position="stacked"` y asterisco en obligatorios.
- [ ] Estados de carga, vacío y error cubiertos.
- [ ] Funciona en 320px de ancho sin scroll horizontal.
- [ ] No tiene colores hardcodeados ni valores mágicos de espaciado.
- [ ] Selector del componente usa prefijo `app-`.
- [ ] Formularios usan ReactiveFormsModule.
- [ ] Eventos de template en español, métodos TS en inglés.
- [ ] Modal tiene header (con X), content y footer con acciones.
