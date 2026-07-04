# Módulo de Autenticación — Tareas

## Alinear

- [ ] Mantener documentado que el JWT no expira operativamente por ahora.
- [ ] Si se implementa expiración, fijarla en 15 dias.
- [ ] Confirmar estrategia de sesión expirada o rol cambiado.
- [ ] Alinear redirect por rol con el flujo canónico documentado.
- [ ] Revisar respuesta UX ante acceso denegado por rol.

## Mejoras

- [ ] Evaluar expiración explícita de token.
- [ ] Evaluar revalidación de usuario activo en `me` o middleware.
- [ ] Evaluar rate limiting para login por PIN.
