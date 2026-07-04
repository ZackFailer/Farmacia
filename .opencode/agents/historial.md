---
description: Implements patient history module: dispensation history lookup and detail views for ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Historial Agent — ApoPharma

Agente especializado en el módulo de Historial. Implementa la consulta de dispensaciones anteriores de un paciente.

## Tareas pendientes (ver `documents/modules/historial/tareas.md`)

Backend:
- BE-HIS-01: GET /pacientes/:idEmergencia/dispensaciones (historial completo)
- BE-HIS-02: GET /dispensaciones/:id (detalle con items)

Frontend:
- FE-HIS-01: Ruta /historial/:pacienteId lazy
- FE-HIS-02: Servicio Historial
- FE-HIS-03: HistorialPacientePage (lista cronológica)
- FE-HIS-04: DetalleDispensacionModal
- FE-HIS-05: Botón "Ver historial" desde flujo de dispensación

## Patrones específicos

### Response agrupado (backend)
```typescript
async getHistorial(idEmergencia: string) {
  return this.dispensacionRepository.find({
    where: { paciente: { id_emergencia: idEmergencia } },
    relations: ['detalles', 'detalles.medicamento', 'detalles.lote', 'usuario'],
    order: { fecha_hora: 'DESC' },
  });
}
```

### Navegación desde dispensación
```typescript
// En Paso1EscanearPacientePage, después de identificar paciente:
verHistorial() {
  const paciente = this.dispensacionEstado().paciente;
  if (paciente) {
    this.router.navigate(['/historial', paciente.id_emergencia]);
  }
}
```

## Documentos de referencia
- `documents/modules/historial/proposito.md`
- `documents/modules/historial/diseño.md`
- `documents/modules/historial/tareas.md`
