# Módulo de Dispensación — Propósito

## Objetivo

Acelerar la entrega de medicamentos a los médicos/rescatistas minimizando errores mediante un flujo 100% guiado por escaneo QR, con registro rápido de pacientes de emergencia y validación básica de dosis.

## Usuarios

- **Despachador**: ejecuta el flujo completo de dispensación.
- **Farmacéutico**: supervisa dispensaciones y configura límites de dosis.

## Historias de Usuario

- **HU-DIS-01**: Como despachador, quiero escanear el QR del paciente para identificarlo rápidamente.
- **HU-DIS-02**: Como despachador, quiero registrar un paciente de emergencia al vuelo si su QR no existe en el sistema.
- **HU-DIS-03**: Como despachador, quiero escanear los códigos de los lotes a entregar para agilizar la selección.
- **HU-DIS-04**: Como despachador, quiero buscar medicamentos manualmente por si no tengo el código del lote.
- **HU-DIS-05**: Como farmacéutico, quiero que el sistema valide la dosis por peso del paciente y me alerte si excede el límite seguro.
- **HU-DIS-06**: Como despachador, quiero ver un resumen antes de confirmar la entrega.
- **HU-DIS-07**: Como farmacéutico, quiero que el stock se descuente automáticamente al confirmar la dispensación.
- **HU-DIS-08**: Como despachador, quiero marcar al paciente como "damnificado" para priorización y reportes.

## Criterios de Aceptación

1. El flujo de dispensación tiene 3 pasos secuenciales obligatorios.
2. Cada paso valida que el anterior fue completado.
3. El registro de paciente captura: ID emergencia, sexo, edad, peso y esDamnificado.
4. La validación de dosis compara mg/kg contra el máximo configurado.
5. Al confirmar, se descuenta stock y se crea registro de dispensación.
6. Si hay múltiples lotes del mismo medicamento, se consumen primero los más próximos a vencer (FEFO).

## Dependencias

- Tablas: `paciente`, `lote`, `medicamento`, `dispensacion`, `dispensacion_detalle`, `configuracion`
- Escáner QR (servicio compartido)
- Módulo de Inventario (stock se descuenta aquí)
