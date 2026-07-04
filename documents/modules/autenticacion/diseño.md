# Módulo de Autenticación — Diseño

## Flujo principal

1. Usuario ingresa PIN.
2. Backend valida usuario activo.
3. Se retorna JWT + perfil básico.
4. Frontend almacena token y usuario.
5. Se aplica redirect por rol.

## Rutas

- `/login`

## Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Reglas

- Las rutas protegidas deben validar sesión activa.
- Las rutas protegidas por rol deben bloquear acceso indebido sin romper la experiencia.
- El rol del usuario determina menú y landing.
- Los usuarios inactivos no pueden autenticarse.
- No existe expiración operativa obligatoria del JWT por ahora; si se activa, la referencia será 15 dias.

## Roles permitidos

- público para login
- autenticado para `me`
