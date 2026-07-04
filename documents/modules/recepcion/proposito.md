# Módulo de Recepción — Propósito

## Objetivo

Registrar medicamentos y lotes que ingresan al sistema, generando trazabilidad por QR desde el momento del ingreso.

## Roles permitidos

- `recepcionista_med`
- `admin`

## Qué resuelve

- alta de medicamentos,
- alta de lotes,
- generación de QR,
- disponibilidad inicial para inventario y dispensación.

## Resultado esperado

Todo lote nuevo debe quedar:

- asociado a un medicamento,
- con stock inicial,
- con fecha de vencimiento,
- con identificador QR,
- visible en inventario.
