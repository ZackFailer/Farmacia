# Módulo de Pacientes — Diseño

## Flujo principal

1. Buscar paciente por QR, ID de emergencia, nombre o cédula.
2. Si no existe, registrarlo.
3. Capturar datos base incluyendo teléfono (opcional).
4. Mostrar QR del paciente luego de crear el registro para compartir por WhatsApp.
5. Abrir detalle.
6. Editar datos si aplica.
7. Permitir visualizar QR desde detalle cuando se necesite reescanear.
8. Agregar o quitar familiares del núcleo.
9. Saltar a historial o receta según contexto.

## Pantallas

- `/pacientes`
- `/pacientes/:id`

## Endpoints

- `POST /api/v1/pacientes`
- `GET /api/v1/pacientes?q=...`
- `GET /api/v1/pacientes/emergencia/:idEmergencia`
- `GET /api/v1/pacientes/:id`
- `PATCH /api/v1/pacientes/:id`
- `DELETE /api/v1/pacientes/:id`
- `GET /api/v1/pacientes/:id/nucleo`
- `POST /api/v1/pacientes/:id/nucleo`
- `DELETE /api/v1/pacientes/:id/nucleo/:miembroId`

## Reglas

- El identificador operativo principal es `idEmergencia`.
- La búsqueda debe manejar múltiples resultados cuando aplique.
- El borrado debe ser lógico.

## Roles permitidos

- `recepcionista`
- `doctor`
- `admin`
