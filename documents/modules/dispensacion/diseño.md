# Módulo de Dispensación — Diseño

## Pantallas (Flujo de 3 Pasos)

### Paso 1: Escanear Paciente (`/dispensacion/paso1`)

```
┌─────────────────────────────┐
│  ← Volver    Dispensación   │
│              Paso 1/3       │
├─────────────────────────────┤
│                             │
│   [Área de escaneo QR]      │
│                             │
│   Escanee el código del     │
│   paciente (brazalete/      │
│   receta)                   │
│                             │
│   ─── o ───                │
│                             │
│   [Buscar paciente manual]  │
│   [Registrar nuevo paciente]│
├─────────────────────────────┤
│ Paciente: Juan Pérez        │  ← aparece tras escanear
│ ID: EM-2026-001             │
│ Damnificado: Sí             │
├─────────────────────────────┤
│        [Siguiente →]        │  habilitado tras identificar
└─────────────────────────────┘
```

### Paso 2: Seleccionar Medicamentos (`/dispensacion/paso2`)

```
┌─────────────────────────────┐
│  ← Volver    Paso 2/3       │
├─────────────────────────────┤
│ Paciente: Juan Pérez        │
├─────────────────────────────┤
│                             │
│ [Escanear código de lote]   │
│   ─── o ───                │
│ [Buscar medicamento]        │
│                             │
│ Receta actual:              │
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Lote: L-002   Cant: 2   │ │  [✕]
│ │ Stock disp: 500unds     │ │
│ ├─────────────────────────┤ │
│ │ Paracetamol 500mg       │ │
│ │ Lote: L-001   Cant: 1   │ │  [✕]
│ │ Stock disp: 200unds     │ │
│ └─────────────────────────┘ │
│                             │
│        [← Anterior] [Siguiente →]
└─────────────────────────────┘
```

### Paso 3: Confirmación (`/dispensacion/paso3`)

```
┌─────────────────────────────┐
│  ← Volver    Paso 3/3       │
├─────────────────────────────┤
│ Resumen de Entrega          │
│                             │
│ Paciente: Juan Pérez        │
│ ID: EM-2026-001             │
│ Peso: 70 kg                 │
│ Damnificado: Sí             │
│                             │
│ Medicamentos:               │
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Lote: L-002   Cant: 2   │ │
│ │ Dosis: 7.14 mg/kg       │ │ ✅
│ ├─────────────────────────┤ │
│ │ Paracetamol 500mg       │ │
│ │ Lote: L-001   Cant: 1   │ │
│ │ Dosis: 7.14 mg/kg       │ │ ✅
│ └─────────────────────────┘ │
│                             │
│        [← Anterior] [Confirmar Entrega]
└─────────────────────────────┘
```

## Modales

### Registro Rápido de Paciente

```
┌─ Registro de Paciente ─────┐
│                             │
│ ID de Emergencia * [_______]│
│ Sexo *         [ M ] [ F ] │
│ Edad estimada * [_________]│
│ Peso estimado * [_________]│
│ ¿Es damnificado? [Sí] [No] │
│                             │
│    [Cancelar] [Guardar]    │
└─────────────────────────────┘
```

### Validación de Dosis

```
┌─── Validación de Dosis ────┐
│                             │
│ ⚠️ Dosis por encima del    │
│    límite seguro            │
│                             │
│ Medicamento: Amoxicilina    │
│ Dosis calculada: 14.3 mg/kg │
│ Límite máximo: 10 mg/kg     │
│                             │
│ ¿Desea continuar?           │
│                             │
│   [Cancelar]  [Continuar]  │
└─────────────────────────────┘
```

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `Paso1EscanearPacientePage` | Page | Escáner QR + búsqueda manual |
| `Paso2SeleccionarMedsPage` | Page | Escáner QR lote + lista receta |
| `Paso3ConfirmarPage` | Page | Resumen + validación + confirmación |
| `RegistroPacienteModal` | Modal | Crear paciente al vuelo |
| `BusquedaPacienteModal` | Modal | Buscar paciente por ID |
| `BusquedaMedicamentoModal` | Modal | Buscar y agregar medicamento |
| `ValidacionDosisModal` | Modal | Alerta de dosis máxima |
| `ConfirmacionEntregaModal` | Modal | Confirmar y descontar |
| `ResumenRecetaComponent` | Component | Tabla de items en receta actual |
| `EncabezadoPasoComponent` | Component | Indicador de progreso (paso 1/3, 2/3, 3/3) |

## API Backend

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/pacientes` | Registrar paciente |
| GET | `/api/v1/pacientes/:idEmergencia` | Buscar paciente por ID |
| GET | `/api/v1/medicamentos?search=` | Buscar medicamentos |
| GET | `/api/v1/lotes/disponibles/:medicamentoId` | Lotes disponibles FEFO |
| GET | `/api/v1/configuraciones/:medicamentoId/dosis` | Obtener límite de dosis |
| POST | `/api/v1/dispensaciones` | Crear dispensación (descuenta stock) |

## Lógica de Negocio

### Validación de Dosis
```
dosisCalculada = cantidad * concentracion / pesoPaciente
if config.dosis_maxima_mg_kg existe AND dosisCalculada > config.dosis_maxima_mg_kg:
    → ALERTA: mostrar modal con opción "Continuar de todas formas"
else:
    → ✅ Válido
```

### Descuento de Stock (FEFO)
```
Al confirmar dispensación:
1. Ordenar lotes disponibles del medicamento por fecha_vencimiento ASC
2. Consumir del lote más próximo a vencer primero
3. Actualizar cantidad_actual de cada lote
4. Si cantidad_actual llega a 0, marcar lote como agotado
```

## Estado del Flujo (Compartido entre pasos)

```typescript
interface EstadoDispensacion {
  paciente: Paciente | null;
  items: RecetaItem[];  // { medicamento, lote, cantidad }
  paso: 1 | 2 | 3;
}

// Almacenado en servicio con señal
private estado = signal<EstadoDispensacion>({
  paciente: null,
  items: [],
  paso: 1
});
```
