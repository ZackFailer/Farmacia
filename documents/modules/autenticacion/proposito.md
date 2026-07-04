# Módulo de Autenticación — Propósito

## Objetivo

Autenticar usuarios por PIN, mantener sesión segura y redirigir a cada rol a su flujo principal de trabajo.

## Roles

- `recepcionista`
- `doctor`
- `farmaceutico`
- `recepcionista_med`
- `admin`

## Qué resuelve

- entrada única al sistema,
- identificación del rol activo,
- control de acceso por módulo,
- persistencia de sesión en el dispositivo.

## Resultado esperado

Cada usuario debe entrar al módulo correcto según su responsabilidad:

- `recepcionista` → Pacientes
- `doctor` → Recetas
- `farmaceutico` → Cola de dispensación
- `recepcionista_med` → Recepción
- `admin` → Administración
