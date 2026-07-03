# Plan de Implementación — Frontend (Angular 21 + Ionic 8)

## 1. Stack y Herramientas

| Concepto | Decisión |
|---|---|
| Framework | Angular 21 standalone |
| UI Components | Ionic 8 (standalone) |
| Estilos | SCSS + Ionic CSS utilities |
| Escaneo QR | `@capacitor-mlkit/barcode-scanning` o `html5-qrcode` |
| Impresión | `window.print()` con template dedicado |
| Estado | Señales de Angular (`signal()`, `computed()`) |
| HTTP | `HttpClient` con interceptors |
| Rutas | Angular Router con lazy-loading |
| PWA | `@angular/pwa` (manifest + service worker) |
| Test | Vitest (vía `@angular/build:unit-test`) |

## 2. Estructura de Archivos por Módulo

```
src/app/
├── auth/
│   ├── pages/
│   │   └── login.page.ts              /login
│   ├── services/
│   │   └── auth.service.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── auth.routes.ts
│
├── recepcion/
│   ├── pages/
│   │   └── dashboard-ingresos.page.ts  /recepcion
│   ├── modals/
│   │   ├── ingreso-lote.modal.ts
│   │   ├── nuevo-medicamento.modal.ts
│   │   └── imprimir-etiqueta.modal.ts
│   ├── services/
│   │   └── recepcion.service.ts
│   ├── components/
│   │   └── tabla-ingresos.component.ts
│   └── recepcion.routes.ts
│
├── inventario/
│   ├── pages/
│   │   ├── panel-stock.page.ts         /inventario
│   │   └── configurar-umbrales.page.ts /inventario/umbrales
│   ├── modals/
│   │   ├── ajuste-stock.modal.ts
│   │   ├── detalle-lote.modal.ts
│   │   ├── alerta-stock.modal.ts
│   │   └── editar-umbral.modal.ts
│   ├── services/
│   │   └── inventario.service.ts
│   ├── components/
│   │   └── tarjeta-medicamento.component.ts
│   └── inventario.routes.ts
│
├── dispensacion/
│   ├── pages/
│   │   ├── paso1-escanear-paciente.page.ts   /dispensacion/paso1
│   │   ├── paso2-seleccionar-meds.page.ts     /dispensacion/paso2
│   │   └── paso3-confirmar.page.ts            /dispensacion/paso3
│   ├── modals/
│   │   ├── registro-paciente.modal.ts
│   │   ├── busqueda-paciente.modal.ts
│   │   ├── busqueda-medicamento.modal.ts
│   │   ├── validacion-dosis.modal.ts
│   │   └── confirmacion-entrega.modal.ts
│   ├── services/
│   │   └── dispensacion.service.ts
│   ├── guards/
│   │   └── paso.guard.ts  (protege flujo paso a paso)
│   ├── components/
│   │   └── resumen-receta.component.ts
│   └── dispensacion.routes.ts
│
├── historial/
│   ├── pages/
│   │   └── historial-paciente.page.ts   /historial/:pacienteId
│   ├── modals/
│   │   └── detalle-dispensacion.modal.ts
│   ├── services/
│   │   └── historial.service.ts
│   └── historial.routes.ts
│
├── administracion/
│   ├── pages/
│   │   ├── gestion-usuarios.page.ts     /admin/usuarios
│   │   └── configuracion-general.page.ts /admin/configuracion
│   ├── modals/
│   │   ├── crear-editar-usuario.modal.ts
│   │   └── limites-dosis.modal.ts
│   ├── services/
│   │   └── administracion.service.ts
│   ├── guards/
│   │   └── admin.guard.ts
│   └── administracion.routes.ts
│
├── shared/
│   ├── components/
│   │   ├── escaner-qr.component.ts      (wrapping de librería QR)
│   │   ├── buscador.component.ts        (input + lista filtrable)
│   │   ├── indicador-stock.component.ts  (semáforo de colores)
│   │   └── encabezado-paso.component.ts (para flujo de 3 pasos)
│   ├── pipes/
│   │   └── fecha-relativa.pipe.ts
│   └── models/
│       ├── medicamento.model.ts
│       ├── lote.model.ts
│       ├── paciente.model.ts
│       ├── dispensacion.model.ts
│       ├── usuario.model.ts
│       └── configuracion.model.ts
│
├── core/
│   ├── interceptors/
│   │   ├── auth.interceptor.ts          (adjunta JWT)
│   │   └── error.interceptor.ts         (manejo global errores)
│   ├── services/
│   │   └── escaner.service.ts           (servicio singleton de cámara)
│   └── guards/
│       └── role.guard.ts                (guarda genérico por rol)
│
├── app.routes.ts
├── app.config.ts
└── app.ts
```

## 3. Implementación de Funciones Clave

### Escaneo QR
- Servicio singleton `EscanerService` que maneja ciclo de vida de cámara
- Componente `EscanerQrComponent` emite eventos `(codigoEscaneado)`
- Usar `@capacitor-mlkit/barcode-scanning` para dispositivos móviles
- Fallback a `html5-qrcode` para web/desktop

### Impresión de Etiquetas
- Modal `ImprimirEtiquetaModal` genera HTML con QR y datos del lote
- Usar librería `qrcode` para generar QR en canvas
- Llamar `window.print()` con @media print styles

### Colores Semáforo
- Componente `IndicadorStockComponent` recibe cantidad y umbral
- Verde: stock > umbral * 2
- Amarillo: stock <= umbral
- Rojo: stock = 0

### Validación de Dosis
- Función pura en servicio `DispensacionService`
- Calcula mg/kg = (dosis / peso_estimado)
- Compara con `dosis_maxima_mg_kg` de configuración
- Retorna objeto `{ valida: boolean, mensaje: string, calculo: number }`

## 4. PWA

- Generar manifest con `@angular/pwa`
- Estrategia de caché: `NetworkFirst` para API, `CacheFirst` para assets
- Iconos en múltiples tamaños en `public/`
- Service worker registrado en `main.ts`

## 5. Estilos Globales

```scss
// Variables de colores semáforo
:root {
  --stock-ok: #28a745;
  --stock-bajo: #ffc107;
  --stock-agotado: #dc3545;
  --fondo-alerta: #fff3cd;
  --ion-color-primary: #1a5276; // azul humanitario
}
```

## 6. Responsividad

- Diseño mobile-first (Ionic ya responsive)
- PANTALLAS OPTIMIZADAS: 320px - 768px (teléfonos)
- SOPORTE: tablets y laptops (hasta 1920px)
- Botones grandes (min-height: 48px) para uso táctil
