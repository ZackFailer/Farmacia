# Módulo de Historial — Propósito

## Objetivo

Permitir la consulta de todas las dispensaciones realizadas a un paciente específico, mostrando medicamentos, lotes, dosis y fechas para mejorar la seguridad en la atención humanitaria.

## Usuarios

- **Despachador**: consulta historial durante el flujo de dispensación.
- **Farmacéutico**: revisión completa del historial de pacientes.

## Historias de Usuario

- **HU-HIS-01**: Como despachador, quiero ver el historial de dispensaciones de un paciente inmediatamente después de escanear su código para conocer qué medicamentos ya recibió.
- **HU-HIS-02**: Como farmacéutico, quiero consultar el historial completo de cualquier paciente buscando su ID de emergencia.
- **HU-HIS-03**: Como farmacéutico, quiero ver el detalle de cada dispensación (medicamento, lote, cantidad, dosis, quién despachó).

## Criterios de Aceptación

1. El historial se muestra ordenado por fecha descendente (más reciente primero).
2. Cada entrada muestra: fecha, medicamento, lote, cantidad, dosis (mg/kg).
3. Al tocar una entrada se abre detalle con información completa.
4. El acceso al historial está disponible desde el paso 1 de dispensación y desde una ruta independiente.

## Dependencias

- Tablas: `dispensacion`, `dispensacion_detalle`, `lote`, `medicamento`, `paciente`, `usuario`
- Módulo de Dispensación (los datos los genera ese módulo)
