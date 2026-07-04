# Módulo de Dispensación — Diseño

## Flujo principal oficial

1. Abrir `/dispensacion/cola`.
2. Ver recetas pendientes.
3. Seleccionar receta.
4. Cargar paciente e items recetados.
5. Asignar lote por medicamento.
6. Validar stock, FEFO y dosis.
7. Confirmar entrega.
8. Crear dispensación y marcar receta como `despachada`.

## Flujo alterno manual

La dispensación manual desde `/dispensacion/paso1` sigue existiendo. En ese flujo el farmacéutico debe:

1. identificar o seleccionar paciente,
2. agregar medicamentos entregados,
3. asignar lotes,
4. confirmar entrega,
5. dejar la dispensación asociada al paciente aunque no exista receta.

## Pantallas

- `/dispensacion/cola`
- `/dispensacion/paso1`
- `/dispensacion/paso2`
- `/dispensacion/paso3`

## Endpoints

- `GET /api/v1/dispensaciones/pendientes`
- `GET /api/v1/recetas/pendientes`
- `GET /api/v1/lotes/disponibles/:medicamentoId`
- `GET /api/v1/configuraciones/:medicamentoId/dosis`
- `POST /api/v1/dispensaciones`

## Reglas de negocio

- El backend valida dosis máxima.
- El backend descuenta stock.
- La entrega debe respetar FEFO.
- Si se dispensa contra receta, la receta debe terminar `despachada`.
- La excepción de dosis no puede documentarse como confirmable si backend no la soporta explícitamente.
- Si se dispensa sin receta, los medicamentos entregados deben quedar igualmente asociados al paciente y al detalle de dispensación.

## Roles permitidos

- `farmaceutico`
- `admin`
