# Módulo de Inventario — Diseño

## Pantallas

### 1. Panel de Stock General (`/inventario`)

```
┌─────────────────────────────┐
│  ← Volver     Inventario    │
├─────────────────────────────┤
│ 🔍 [Buscar medicamento...]  │
│ 🏷️ [Todas] [Analgésicos].. │  Filtros de categoría
├─────────────────────────────┤
│ 📌 Vitales                  │  Sección anclada
│ ┌─────────────────────────┐ │
│ │ 🟢 Amoxicilina 500mg    │ │
│ │   Stock: 1,200 unds     │ │
│ │   Vence próximo: 01/27  │ │
│ │   [Ver lotes]           │ │
│ ├─────────────────────────┤ │
│ │ 🟡 Insulina NPH 100UI  │ │
│ │   Stock: 45 unds        │ │  Umbral: 50
│ │   Vence próximo: 03/27  │ │
│ │   [Ver lotes]           │ │
│ └─────────────────────────┘ │
│                             │
│ Todos los medicamentos      │
│ ┌─────────────────────────┐ │
│ │ 🟢 Paracetamol 500mg   │ │
│ │   Stock: 800 unds      │ │
│ │   [Ver lotes]           │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 2. Configuración de Umbrales (`/inventario/umbrales`)

```
┌─────────────────────────────┐
│  ← Volver     Umbrales      │
├─────────────────────────────┤
│ 🔍 [Buscar medicamento...]  │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 500mg       │ │
│ │ Umbral actual: 100 unds │ │
│ │ [Editar]                │ │
│ ├─────────────────────────┤ │
│ │ Insulina NPH 100UI     │ │
│ │ Umbral actual: 50 unds  │ │
│ │ [Editar]                │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 3. Modal Ajuste Rápido (Conteo Físico)

```
┌─ Conteo Físico ────────────┐
│                             │
│ Lote: L-001                │
│ Medicamento: Paracetamol   │
│ Stock actual: 450          │
│                             │
│ Cantidad real contada * [__]│
│                             │
│ Diferencia: +50             │  (se calcula automático)
│                             │
│ [Cancelar] [Ajustar Stock] │
└─────────────────────────────┘
```

### 4. Modal Detalle de Lote

```
┌─ Detalle de Lote L-001 ────┐
│                             │
│ Medicamento: Paracetamol    │
│ Stock: 450 / 500 inicial    │
│ Vencimiento: 12/12/2026     │
│ Donante: MSF                │
│ Ubicación: Estante A-3      │
│                             │
│ Movimientos:                │
│ 01/07 Ingreso: +500        │
│ 02/07 Dispensación: -30    │
│ 03/07 Ajuste: -20          │
│                             │
│ [Reimprimir QR]  [Cerrar]  │
└─────────────────────────────┘
```

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `PanelStockPage` | Page | Vista general con semáforo y filtros |
| `ConfigurarUmbralesPage` | Page | Lista de medicamentos con umbral editable |
| `AjusteStockModal` | Modal | Conteo físico con cálculo de diferencia |
| `DetalleLoteModal` | Modal | Historial de movimientos del lote |
| `AlertaStockModal` | Modal/Toast | Notificación de stock bajo |
| `EditarUmbralModal` | Modal | Editar umbral mínimo de medicamento |
| `TarjetaMedicamentoComponent` | Component | Card individual con indicador de color |
| `IndicadorStockComponent` | Component | Semáforo verde/amarillo/rojo |

## API Backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/inventario` | Stock general con indicadores y filtros |
| GET | `/api/v1/inventario/proximos-vencer` | Lotes próximos a vencer (30 días) |
| PATCH | `/api/v1/lotes/:id/ajustar-stock` | Ajustar por conteo físico |
| GET | `/api/v1/lotes/:id/movimientos` | Historial de movimientos |
| GET | `/api/v1/configuraciones/umbrales` | Listar umbrales |
| PATCH | `/api/v1/configuraciones/:id/umbral` | Actualizar umbral |

## Algoritmo de Color (Semáforo)

```
function colorStock(cantidadActual: number, umbralMinimo: number): 'green' | 'yellow' | 'red' {
  if (cantidadActual === 0) return 'red';
  if (cantidadActual <= umbralMinimo) return 'yellow';
  return 'green';
}
```

## Flujo de Conteo Físico

```
Panel Stock → Botón "Ajustar" → Modal Ajuste
  │
  ├── Usuario ingresa cantidad real contada
  ├── Sistema calcula diferencia (real - sistema)
  └── [Ajustar Stock] → PATCH /lotes/:id/ajustar-stock
        │
        ├── Éxito → Actualizar UI, registro en movimientos
        └── Error → Mostrar mensaje
```
