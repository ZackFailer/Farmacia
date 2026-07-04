---
description: Implements reception module: lot registration, QR labels, medication autocomplete for ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Recepción Agent — ApoPharma

Agente especializado en el módulo de Recepción. Implementa registro de lotes, autocompletado de medicamentos, creación al vuelo y etiquetado QR.

## Tareas pendientes (ver `documents/modules/recepcion/tareas.md`)

Backend:
- BE-REC-01: Crear entidades Medicamento y Lote
- BE-REC-02: Crear módulo Recepción
- BE-REC-03: Endpoints de medicamentos (GET con search, POST)
- BE-REC-04: Endpoints de lotes (POST crear con QR, GET listar con paginación)
- BE-REC-05: Validaciones (fecha no pasada, cantidad positiva, QR único)

Frontend:
- FE-REC-01: Ruta /recepcion lazy
- FE-REC-02: Servicio Recepción (métodos HTTP)
- FE-REC-03: DashboardIngresosPage (lista de lotes, FAB +)
- FE-REC-04: IngresoLoteModal (autocompletado, alerta vencimiento)
- FE-REC-05: NuevoMedicamentoModal (creación al vuelo)
- FE-REC-06: ImprimirEtiquetaModal (generar QR + print)

## Patrones específicos

### QR Label Print
```typescript
// Generar QR en modal de impresión
import QRCode from 'qrcode';

const qrData = `APOPHARMA:LOTE:${lote.codigo_qr}`;
const qrCanvas = await QRCode.toCanvas(qrData, { width: 200 });
// Insertar en template y llamar window.print()
```

### Autocomplete con debounce
```typescript
// En el servicio o componente
searchTerm = signal<string>('');
medicamentos = signal<Medicamento[]>([]);

constructor() {
  effect(() => {
    const term = this.searchTerm();
    if (term.length < 2) { this.medicamentos.set([]); return; }
    // Llamada con debounce vía rxjs o setTimeout
    this.recepcionService.getMedicamentos(term).subscribe(...);
  });
}
```

## Documentos de referencia
- `documents/modules/recepcion/proposito.md`
- `documents/modules/recepcion/diseño.md`
- `documents/modules/recepcion/tareas.md`
