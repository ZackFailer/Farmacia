# Módulo de Historial — Diseño

## Pantallas

### 1. Historial de Paciente (`/historial/:pacienteId`)

```
┌─────────────────────────────┐
│  ← Volver    Historial      │
├─────────────────────────────┤
│ Paciente: Juan Pérez        │
│ ID: EM-2026-001             │
│ Damnificado: Sí             │
├─────────────────────────────┤
│ Dispensaciones (ordenadas   │
│ por fecha descendente)      │
│                             │
│ ┌─────────────────────────┐ │
│ │ 03/07/2026 14:30        │ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Lote: L-002   Cant: 2   │ │
│ │ Dosis: 7.14 mg/kg       │ │
│ │ Despachó: María López   │ │
│ │ [Ver detalle →]         │ │
│ ├─────────────────────────┤ │
│ │ 01/07/2026 09:15        │ │
│ │ Paracetamol 500mg       │ │
│ │ Lote: L-001   Cant: 1   │ │
│ │ Dosis: 7.14 mg/kg       │ │
│ │ Despachó: Carlos Ruiz   │ │
│ │ [Ver detalle →]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Modal Detalle de Dispensación

```
┌─ Detalle de Dispensación ──┐
│                             │
│ Fecha: 03/07/2026 14:30    │
│ Despachó: María López      │
│                             │
│ Paciente: Juan Pérez        │
│ ID: EM-2026-001             │
│ Peso: 70 kg                 │
│                             │
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Lote: L-002             │ │
│ │ Cantidad: 2             │ │
│ │ Dosis: 7.14 mg/kg       │ │
│ ├─────────────────────────┤ │
│ │ Paracetamol 500mg       │ │
│ │ Lote: L-001             │ │
│ │ Cantidad: 1             │ │
│ │ Dosis: 7.14 mg/kg       │ │
│ └─────────────────────────┘ │
│                             │
│ Observaciones: [___________]│
│                             │
│            [Cerrar]        │
└─────────────────────────────┘
```

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `HistorialPacientePage` | Page | Lista de dispensaciones del paciente |
| `DetalleDispensacionModal` | Modal | Detalle completo de una dispensación |

## API Backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/pacientes/:idEmergencia/dispensaciones` | Historial de dispensaciones (ordenado por fecha DESC) |
| GET | `/api/v1/dispensaciones/:id` | Detalle de una dispensación con sus items |

## Flujo de Acceso

```
Desde Paso 1 Dispensación:
  └── Botón "Ver historial" → GET /pacientes/:id/dispensaciones
        └── Lista → [Seleccionar] → GET /dispensaciones/:id → Modal detalle

Desde ruta directa:
  └── /historial/:pacienteId → misma página
```

## Response API

### GET /pacientes/:idEmergencia/dispensaciones
```json
{
  "data": [
    {
      "id": 1,
      "fecha_hora": "2026-07-03T14:30:00Z",
      "items": [
        {
          "medicamento": "Amoxicilina 250mg/5ml",
          "lote_codigo": "L-002",
          "cantidad": 2,
          "dosis_mg_kg": 7.14
        }
      ],
      "despachado_por": "María López"
    }
  ]
}
```
