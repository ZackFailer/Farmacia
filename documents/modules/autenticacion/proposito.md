# Módulo de Autenticación — Propósito

## Objetivo

Autenticar a los usuarios del sistema (farmacéuticos y despachadores) mediante un PIN numérico, redirigiendo a cada rol a su pantalla principal correspondiente.

## Usuarios

- **Farmacéutico/Administrador**: acceso completo a todas las pantallas incluyendo administración.
- **Despachador**: acceso a recepción, inventario, dispensación e historial. Sin acceso a administración.

## Historias de Usuario

- **HU-AUT-01**: Como farmacéutico, quiero iniciar sesión con mi PIN para acceder al sistema.
- **HU-AUT-02**: Como despachador, quiero iniciar sesión con mi PIN para comenzar a dispensar.
- **HU-AUT-03**: Como usuario, quiero que el sistema recuerde mi última sesión para no tener que autenticarme repetidamente si uso el mismo dispositivo.
- **HU-AUT-04**: Como administrador, quiero recuperar/restablecer mi PIN si lo olvido.

## Criterios de Aceptación

1. El login valida PIN contra backend y retorna JWT.
2. Tras autenticación exitosa, redirige según rol:
   - Farmacéutico → `/recepcion`
   - Despachador → `/dispensacion/paso1`
3. Rutas protegidas redirigen a `/login` si no hay token válido.
4. El token JWT expira después de 8 horas.
5. El PIN debe tener entre 4 y 6 dígitos numéricos.

## Dependencias

- Módulo `Usuario` en backend (para validar PIN y rol).
- `JwtModule` de NestJS para emisión y verificación de tokens.
