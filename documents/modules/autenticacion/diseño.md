# Módulo de Autenticación — Diseño

## Pantallas

### 1. Inicio de Sesión (`/login`)

```
┌─────────────────────────────┐
│                             │
│     [Logo ApoPharma]        │
│                             │
│   ┌───────────────────┐     │
│   │   PIN de acceso    │     │
│   │   [●] [●] [●] [●]  │     │
│   └───────────────────┘     │
│                             │
│   [ 1 ] [ 2 ] [ 3 ]        │
│   [ 4 ] [ 5 ] [ 6 ]        │
│   [ 7 ] [ 8 ] [ 9 ]        │
│   [   ] [ 0 ] [⌫]          │
│                             │
│   [Recuperar PIN]           │
└─────────────────────────────┘
```

- Teclado numérico virtual (táctil)
- Input tipo PIN con 4-6 dígitos, oculto con `●`
- Botón "Recuperar PIN" abre modal
- Al presionar "Enter" después de 4 dígitos intenta login automático

### 2. Modal Recuperación de PIN

- Solicita nombre de usuario
- Muestra PIN en texto (solo administrador puede verlo)
- Opción de reasignar nuevo PIN aleatorio

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `LoginPage` | Page | Pantalla completa con teclado numérico |
| `RecuperarPinModal` | Modal | Diálogo para recuperación de PIN |

## API Backend

| Método | Ruta | Body | Response |
|---|---|---|---|
| POST | `/api/v1/auth/login` | `{ pin: string }` | `{ token: string, usuario: {...} }` |

## Flujo de Autenticación

```
LoginPage
  │
  ├── Usuario ingresa PIN (4-6 dígitos)
  │
  ├── POST /api/v1/auth/login { pin }
  │     │
  │     ├── Éxito → { token, usuario }
  │     │     ├── Guardar token en localStorage
  │     │     └── Redirigir según rol
  │     │
  │     └── Error → Mostrar "PIN inválido"
  │
  └── Botón "Recuperar PIN" → modal
```

## Guards

- `AuthGuard`: verifica existencia y validez del JWT. Redirige a `/login` si no hay token.
- `RoleGuard`: verifica que el rol del usuario incluya los roles permitidos en la ruta.

## Data Flow

```
AuthService (FE) ──POST──> AuthController (BE) ──> AuthService (BE)
                                                      │
                                               UsuarioRepository.findByPin()
                                                      │
                                               JwtService.sign(payload)
                                                      │
                                              ←── { token, usuario }
```

## Token Storage

- `localStorage` con clave `apoPharma_token`
- `AuthInterceptor` attacha `Authorization: Bearer <token>` en cada request
- `AuthGuard` en frontend verifica expiración antes de cada navegación
