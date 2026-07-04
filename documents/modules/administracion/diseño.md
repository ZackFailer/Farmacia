# Módulo de Administración — Diseño

## Flujo principal

1. Abrir gestión de usuarios.
2. Crear, editar o desactivar usuarios.
3. Revisar configuración general.
4. Ajustar parámetros globales o clínicos.
5. Gestionar umbrales operativos por medicamento.

## Pantallas

- `/admin/usuarios`
- `/admin/configuracion`

## Endpoints

- `GET /api/v1/usuarios`
- `POST /api/v1/usuarios`
- `PATCH /api/v1/usuarios/:id`
- `DELETE /api/v1/usuarios/:id`
- `GET /api/v1/configuraciones`
- `PATCH /api/v1/configuraciones/:id`
- `GET /api/v1/configuraciones/umbrales`
- `PATCH /api/v1/configuraciones/:id/umbral`

## Reglas

- Solo `admin` puede acceder.
- Los usuarios deben tener rol explícito del nuevo modelo.
- La gestión de configuración debe distinguir umbral operativo y límite clínico.
- Los usuarios inactivos permanecen en el sistema pero no pueden acceder a la aplicación.
