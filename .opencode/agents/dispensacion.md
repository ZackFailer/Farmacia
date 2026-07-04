---
description: Implements dispensation module: 3-step scan flow, patient registration, dose validation for ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Dispensación Agent — ApoPharma

Agente especializado en el módulo de Dispensación. Implementa el flujo de 3 pasos guiado por escaneo QR, registro de pacientes de emergencia y validación de dosis.

## Tareas pendientes (ver `documents/modules/dispensacion/tareas.md`)

Backend:
- BE-DIS-01: Entidades Paciente, Dispensacion, DispensacionDetalle
- BE-DIS-02: Módulo Dispensación
- BE-DIS-03: Endpoints paciente (POST, GET por ID emergencia)
- BE-DIS-04: Endpoint lotes disponibles FEFO
- BE-DIS-05: Endpoint límite de dosis
- BE-DIS-06: Endpoint crear dispensación (TRANSACCIÓN: crear + descontar stock)

Frontend:
- FE-DIS-01: Rutas /dispensacion/paso{1,2,3}
- FE-DIS-02: Servicio Dispensación + estado compartido (señales)
- FE-DIS-03: EncabezadoPasoComponent (shared)
- FE-DIS-04 al FE-DIS-06: Paso1 (escanear paciente + registro)
- FE-DIS-07 al FE-DIS-08: Paso2 (seleccionar meds + búsqueda)
- FE-DIS-09 al FE-DIS-11: Paso3 (confirmar + validación dosis)

## Patrones específicos

### Estado compartido (señales)
```typescript
interface EstadoDispensacion {
  paciente: Paciente | null;
  items: RecetaItem[];
  paso: 1 | 2 | 3;
}

private _estado = signal<EstadoDispensacion>({ paciente: null, items: [], paso: 1 });
readonly estado = this._estado.asReadonly();

setPaciente(p: Paciente) {
  this._estado.update(e => ({ ...e, paciente: p, paso: 2 }));
}

agregarItem(item: RecetaItem) {
  this._estado.update(e => ({ ...e, items: [...e.items, item] }));
}
```

### Lógica FEFO (backend)
```typescript
async crearDispensacion(dto: CrearDispensacionDto): Promise<Dispensacion> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Crear dispensacion
    // 2. Por cada item:
    //    a. Obtener lotes disponibles ordenados por fecha_vencimiento ASC
    //    b. Consumir del más próximo a vencer
    //    c. Actualizar cantidad_actual
    //    d. Crear dispensacion_detalle
  });
}
```

### Validación de dosis (frontend)
```typescript
async validarDosis(item: RecetaItem, pesoPaciente: number): Promise<ValidacionDosis> {
  const config = await this.dispensacionService.getLimiteDosis(item.medicamentoId);
  if (!config?.dosis_maxima_mg_kg) return { valida: true };

  const dosisCalculada = (item.cantidad * item.concentracion) / pesoPaciente;
  return {
    valida: dosisCalculada <= config.dosis_maxima_mg_kg,
    calculada: dosisCalculada,
    maximo: config.dosis_maxima_mg_kg,
  };
}
```

## Documentos de referencia
- `documents/modules/dispensacion/proposito.md`
- `documents/modules/dispensacion/diseño.md`
- `documents/modules/dispensacion/tareas.md`
