# Módulo de Recepción — Propósito

## Objetivo

Registrar de forma rápida cada lote de medicamentos e insumos que ingresa a la farmacia, generando una identificación única (código QR) para su trazabilidad total.

## Usuarios

- **Despachador**: ingresa lotes al sistema.
- **Farmacéutico**: supervisa ingresos y puede corregir datos.

## Historias de Usuario

- **HU-REC-01**: Como despachador, quiero registrar un lote entrante con todos sus datos para que quede disponible en inventario.
- **HU-REC-02**: Como despachador, quiero que el sistema autocomplete el medicamento mientras escribo para agilizar el ingreso.
- **HU-REC-03**: Como despachador, quiero crear un nuevo medicamento al vuelo si no existe en el catálogo.
- **HU-REC-04**: Como farmacéutico, quiero que al guardar un lote se genere e imprima automáticamente una etiqueta QR.
- **HU-REC-05**: Como farmacéutico, quiero reimprimir la etiqueta QR de cualquier lote existente.
- **HU-REC-06**: Como farmacéutico, quiero ver una alerta si el lote tiene fecha de vencimiento menor a 3 meses.
- **HU-REC-07**: Como despachador, quiero ver el historial de ingresos recientes ordenado por fecha.

## Criterios de Aceptación

1. Formulario de lote con autocompletado de medicamentos existentes.
2. Modal anidado para crear medicamento nuevo sin salir del flujo.
3. Al guardar, se descarga/imprime etiqueta con QR único.
4. Alerta visual si fecha de vencimiento < 3 meses.
5. Dashboard muestra últimos 50 ingresos con paginación.
6. QR contiene ID único del lote legible por cámara.

## Dependencias

- Tablas: `medicamento`, `lote`
- Biblioteca de generación QR (`qrcode`)
- Impresión: HTML + CSS print
