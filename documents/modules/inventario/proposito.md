# Módulo de Inventario — Propósito

## Objetivo

Proveer al farmacéutico líder de una vista en tiempo real del inventario total, con alertas que eviten desabastecimientos de productos críticos y permitan ajustes por conteo físico.

## Usuarios

- **Farmacéutico**: acceso completo a panel, umbrales y ajustes.
- **Despachador**: consulta de stock sin acceso a configuración de umbrales.

## Historias de Usuario

- **HU-INV-01**: Como farmacéutico, quiero ver el stock general con colores semáforo para identificar rápidamente productos críticos.
- **HU-INV-02**: Como farmacéutico, quiero que los medicamentos vitales aparezcan al inicio del listado.
- **HU-INV-03**: Como farmacéutico, quiero filtrar el inventario por nombre, categoría y ubicación.
- **HU-INV-04**: Como despachador, quiero ver qué lotes están próximos a vencer.
- **HU-INV-05**: Como farmacéutico, quiero ajustar el stock mediante conteo físico, dejando registro de la diferencia.
- **HU-INV-06**: Como farmacéutico, quiero configurar umbrales mínimos por medicamento para recibir alertas.
- **HU-INV-07**: Como farmacéutico, quiero recibir una alerta al iniciar sesión si algún medicamento vital está bajo stock.
- **HU-INV-08**: Como farmacéutico, quiero ver el historial de movimientos de un lote (ingresos, dispensaciones, ajustes).

## Criterios de Aceptación

1. El panel de stock usa colores semáforo: verde (normal), amarillo (bajo), rojo (agotado).
2. Medicamentos vitales se muestran al inicio (anclados).
3. Filtros funcionan en tiempo real (lado cliente para datos ya cargados).
4. El conteo físico actualiza `cantidad_actual` y registra la diferencia en `dispensacion_detalle` con tipo "ajuste".
5. Los umbrales se persisten por medicamento en tabla `configuracion`.
6. Alertas de stock bajo se muestran como toast/notificación al entrar al panel.

## Dependencias

- Tablas: `medicamento`, `lote`, `dispensacion_detalle`, `configuracion`
- Módulo de Dispensación (stock se descuenta desde allí)
