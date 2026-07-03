# Módulo de Recepción — Diseño

## Pantallas

### 1. Dashboard de Ingresos (`/recepcion`)

```
┌─────────────────────────────┐
│  ← Volver    Recepción   [+]│  ← FAB para nuevo ingreso
├─────────────────────────────┤
│ 🔍 [Buscar medicamento...]  │
├─────────────────────────────┤
│  Lotes Recientes            │
│ ┌─────────────────────────┐ │
│ │ Paracetamol 500mg       │ │
│ │ Lote: L-001  Vto: 12/26 │ │
│ │ 200 unds  Donante: MSF  │ │
│ │ [Reimprimir QR]         │ │
│ ├─────────────────────────┤ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Lote: L-002  Vto: 08/26 │ │  ⚠️ Vence pronto
│ │ 500 unds  Donante: OMS  │ │
│ │ [Reimprimir QR]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 2. Modal Ingreso Rápido de Lote

```
┌─ Ingreso de Lote ───────────┐
│                             │
│ Medicamento * [___________▼]│  Autocompletado + crear nuevo
│                             │
│ [Crear nuevo medicamento]   │  → abre modal anidado
│                             │
│ Presentación * [____________]│
│ Concentración * [___________]│
│ Cantidad * [_______________]│
│ Fecha Vencimiento * [______]│  ⚠️ Alerta si < 3 meses
│ Donante [_________________]│
│ Ubicación [_______________]│
│                             │
│        [Cancelar] [Guardar] │
└─────────────────────────────┘
```

### 3. Modal Nuevo Medicamento (anidado)

```
┌─ Nuevo Medicamento ─────────┐
│                             │
│ Nombre Genérico * [________]│
│ Nombre Comercial [________]│
│ Presentación * [__________]│
│ Concentración * [_________]│
│                             │
│      [Cancelar] [Guardar]  │
└─────────────────────────────┘
```

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `DashboardIngresosPage` | Page | Lista de lotes recientes con FAB para ingreso |
| `IngresoLoteModal` | Modal | Formulario completo de lote |
| `NuevoMedicamentoModal` | Modal | Creación rápida de medicamento |
| `ImprimirEtiquetaModal` | Modal | Previsualización + impresión QR |
| `TablaIngresosComponent` | Component | Tabla/listItem de lotes recientes |

## API Backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/medicamentos` | Listar todos (para autocompletado) |
| POST | `/api/v1/medicamentos` | Crear medicamento |
| GET | `/api/v1/lotes` | Listar lotes (paginado, ordenado por fecha) |
| POST | `/api/v1/lotes` | Crear lote + generar QR |
| GET | `/api/v1/lotes/:id` | Detalle del lote |
| GET | `/api/v1/lotes/:id/qr` | Obtener QR (SVG/PNG) |

## Flujo de Ingreso de Lote

```
[FAB +] --> Modal Ingreso Lote
              │
              ├── Usuario escribe medicamento → GET /medicamentos?search=
              │     └── No existe → [Crear nuevo] → Modal Nuevo Med → POST /medicamentos
              │
              ├── Usuario completa campos
              │     └── Fecha vencimiento < 3m → Alerta visual ⚠️
              │
              └── [Guardar] → POST /lotes
                    │
                    ├── Éxito → Modal Impresión QR → Imprimir
                    └── Error → Mostrar validación
```

## Reglas de Negocio

1. El código QR se genera automáticamente con formato: `APOPHARMA:LOTE:{UUID}`
2. La alerta de vencimiento se muestra en tiempo real al seleccionar fecha
3. El autocompletado busca por coincidencia parcial en nombre genérico y comercial
4. Al guardar un lote, `cantidad_actual = cantidad_inicial`
