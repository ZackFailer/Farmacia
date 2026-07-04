# Módulo de Historial — Diseño

## Flujo principal

1. Llegar a historial desde paciente, receta o dispensación.
2. Buscar paciente por QR, cédula, nombre o `idEmergencia`.
3. Seleccionar paciente de resultados y abrir `/historial/:idEmergencia`.
4. Ver lista de dispensaciones previas.
5. Abrir detalle de una dispensación.

## Pantalla

- `/historial`
- `/historial/:idEmergencia`

## Endpoints

- `GET /api/v1/pacientes/:idEmergencia/dispensaciones`
- `GET /api/v1/dispensaciones/:id`

## Reglas

- La ruta funcional debe usar `idEmergencia` de forma explícita.
- La búsqueda previa puede usar QR, cédula o nombre, pero la navegación final siempre usa `idEmergencia`.
- El historial no crea ni modifica datos.

## Roles permitidos

- `doctor`
- `farmaceutico`
- `admin`
