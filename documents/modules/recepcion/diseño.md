# Módulo de Recepción — Diseño

## Flujo principal

1. Buscar medicamento existente.
2. Si no existe, crearlo sin salir del flujo.
3. Registrar lote con cantidad, vencimiento, donante y ubicación.
4. Generar o consultar QR del lote.
5. Mostrar ingresos recientes.

## Pantalla principal

- `/recepcion`

## Endpoints

- `GET /api/v1/medicamentos`
- `POST /api/v1/medicamentos`
- `GET /api/v1/lotes`
- `POST /api/v1/lotes`
- `GET /api/v1/lotes/:id`
- `GET /api/v1/lotes/:id/qr`

## Reglas

- No se usa para pacientes.
- Todo lote debe quedar trazable por QR.
- El ingreso crea disponibilidad para inventario y dispensación.

## Roles permitidos

- `recepcionista_med`
- `admin`
