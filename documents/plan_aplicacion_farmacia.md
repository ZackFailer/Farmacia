# Plan Detallado del Sistema de Gestión de Farmacia de Emergencia «ApoPharma»

> Documento legado. Ya no debe usarse como referencia funcional principal.

La documentación vigente del sistema fue reorganizada y normalizada en los siguientes documentos:

- `documents/base.md`
- `documents/frontend-plan.md`
- `documents/backend-plan.md`
- `documents/modules/*/proposito.md`
- `documents/modules/*/diseño.md`
- `documents/modules/*/tareas.md`

## Estado

Este archivo describe un modelo funcional anterior con roles y flujos ya reemplazados.

Entre las diferencias más importantes respecto al modelo vigente:

- el rol `despachador` fue eliminado,
- el sistema ahora opera con cinco roles oficiales,
- `Pacientes` y `Recetas` son módulos formales independientes,
- la dispensación principal entra por cola de recetas,
- la gestión de umbrales es administrativa,
- los usuarios inactivos permanecen en sistema pero sin acceso.

## Modelo vigente

El modelo oficial actual se basa en estos roles:

1. `recepcionista`
2. `doctor`
3. `farmaceutico`
4. `recepcionista_med`
5. `admin`

## Uso recomendado

No extender ni corregir este documento salvo para dejar constancia de su obsolescencia.

Toda actualización funcional futura debe hacerse en la documentación canónica vigente.
