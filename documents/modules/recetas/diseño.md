# Módulo de Recetas — Diseño

## Flujo principal

1. El `doctor` inicia sesión y entra directamente a `/recetas`.
2. Identifica paciente por QR o búsqueda manual.
3. Selecciona al paciente encontrado.
4. Muestra datos básicos del paciente.
5. Muestra historial completo de recetas previas del paciente, incluyendo estados (`pendiente`, `despachada`, `cancelada`) y medicamentos recetados anteriormente.
6. Tras verificar identidad e historial, habilita la acción `Nueva receta`.
7. Muestra una lista filtrable de medicamentos en stock.
8. El doctor selecciona medicamentos e indica cantidad y dias.
9. Confirma la receta.
10. Guarda con estado `pendiente` y la envía a cola de despacho.

## Pantalla

- `/recetas`

## Endpoints

- `POST /api/v1/recetas`
- `GET /api/v1/recetas/paciente/:pacienteId`
- `GET /api/v1/recetas/:id`
- `GET /api/v1/medicamentos`

## Reglas

- La receta es el flujo clínico principal previo a dispensación.
- Debe usar medicamentos existentes en catálogo.
- Debe mostrar disponibilidad clínica desde este módulo mediante lista filtrable de medicamentos en stock.
- El historial mostrado antes de recetar es parte obligatoria del flujo del doctor.

## Roles permitidos

- `doctor`
- `admin`
