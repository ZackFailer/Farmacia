# Módulo de Inventario — Diseño

## Flujo principal

1. Abrir panel de stock.
2. Filtrar o buscar medicamento.
3. Revisar estado semafórico, lotes y vencimientos.
4. Abrir movimientos por lote.
5. Ajustar stock cuando aplica.
6. Revisar umbrales solo si el usuario es `admin`.

## Pantallas

- `/inventario`
- `/inventario/umbrales` (`admin`)

## Endpoints

- `GET /api/v1/inventario`
- `GET /api/v1/inventario/proximos-vencer`
- `PATCH /api/v1/lotes/:id/ajustar-stock`
- `GET /api/v1/lotes/:id/movimientos`
- `GET /api/v1/configuraciones/umbrales` (`admin`)
- `PATCH /api/v1/configuraciones/:id/umbral` (`admin`)

## Reglas

- Los ajustes deben quedar trazables.
- Los umbrales son administrativos, no sustituyen criterio clínico.
- El módulo es operativo; la consulta clínica resumida debe exponerse desde Recetas si se requiere.

## Roles permitidos

- `recepcionista_med`
- `farmaceutico`
- `admin`
