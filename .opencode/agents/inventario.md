---
description: Implements inventory module: stock panel, thresholds, physical count, alerts for ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Inventario Agent — ApoPharma

Agente especializado en el módulo de Inventario. Implementa panel de stock con semáforo, filtros, umbrales, conteo físico y alertas.

## Tareas pendientes (ver `documents/modules/inventario/tareas.md`)

Backend:
- BE-INV-01: Endpoint GET /inventario (agrupado, semáforo, filtros)
- BE-INV-02: Endpoint próximos a vencer
- BE-INV-03: Ajuste de stock (conteo físico con registro de diferencia)
- BE-INV-04: Endpoint movimientos de lote
- BE-INV-05: Endpoints de umbrales (GET, PATCH)

Frontend:
- FE-INV-01: Rutas /inventario y /inventario/umbrales
- FE-INV-02: Servicio Inventario
- FE-INV-03: PanelStockPage con semáforo y filtros
- FE-INV-04: IndicadorStockComponent (shared)
- FE-INV-05: TarjetaMedicamentoComponent
- FE-INV-06: AjusteStockModal
- FE-INV-07: DetalleLoteModal
- FE-INV-08: ConfigurarUmbralesPage

## Patrones específicos

### Indicador de color (semáforo)
```typescript
@Input() cantidad: number = 0;
@Input() umbral: number = 0;

get colorClase(): string {
  if (this.cantidad === 0) return 'stock-agotado';
  if (this.cantidad <= this.umbral) return 'stock-bajo';
  return 'stock-ok';
}
```

```scss
.stock-ok { color: var(--stock-ok, #28a745); }
.stock-bajo { color: var(--stock-bajo, #ffc107); }
.stock-agotado { color: var(--stock-agotado, #dc3545); }
```

### Ajuste de stock (conteo físico)
```typescript
// En el modal
cantidadReal = signal<number>(0);
diferencia = computed(() => this.cantidadReal() - this.lote().cantidad_actual);

ajustar() {
  this.inventarioService.ajustarStock(this.lote().id, this.cantidadReal())
    .subscribe(...);
}
```

## Documentos de referencia
- `documents/modules/inventario/proposito.md`
- `documents/modules/inventario/diseño.md`
- `documents/modules/inventario/tareas.md`
