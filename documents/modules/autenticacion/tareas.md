# Módulo de Autenticación — Tareas

## Backend

### BE-AUT-01: Crear entidad Usuario
- [ ] Definir `usuario.entity.ts` con campos: id, nombre, rol (enum), pin_hash, created_at, updated_at
- [ ] Configurar índice único en pin si aplica
- [ ] Ejecutar migración / sync

### BE-AUT-02: Crear módulo Auth
- [ ] Generar `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`
- [ ] Instalar `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
- [ ] Configurar `JwtModule.register()` con secret y expiración (8h)

### BE-AUT-03: Implementar login
- [ ] Crear `LoginDto` con validación (`@IsString`, `@Length(4,6)`)
- [ ] En `AuthService.login()`: buscar usuario por PIN, validar, firmar JWT
- [ ] Retornar `{ token, usuario }` (sin pin_hash)
- [ ] Escribir test unitario de `AuthService.login()`

### BE-AUT-04: Implementar JWT Strategy y Guard
- [ ] Crear `JwtStrategy` que extrae payload del token
- [ ] Crear `JwtAuthGuard` para rutas protegidas
- [ ] Crear `RolesGuard` + decorador `@Roles()` para control por rol

### BE-AUT-05: Proteger rutas existentes
- [ ] Aplicar `JwtAuthGuard` globalmente (o en cada módulo)
- [ ] Aplicar `RolesGuard` en rutas de administración

## Frontend

### FE-AUT-01: Crear LoginPage
- [ ] Generar página `login.page.ts` con ruta `/login`
- [ ] Diseñar template con teclado numérico y campo PIN
- [ ] Validar entrada (solo dígitos, 4-6 caracteres)

### FE-AUT-02: Crear AuthService
- [ ] Método `login(pin: string): Observable<{token, usuario}>`
- [ ] Método `logout()`: limpiar token y redirigir a `/login`
- [ ] Método `getToken(): string | null`
- [ ] Método `getUsuario(): Usuario | null`
- [ ] Método `isLoggedIn(): boolean`
- [ ] Guardar token en `localStorage`

### FE-AUT-03: Crear interceptors
- [ ] `AuthInterceptor`: adjuntar `Authorization` header
- [ ] `ErrorInterceptor`: capturar 401 y hacer logout automático

### FE-AUT-04: Crear guards de ruta
- [ ] `AuthGuard`: redirigir a `/login` si no hay token
- [ ] `RoleGuard`: redirigir si el rol no tiene permiso
- [ ] Configurar redirect según rol en `app.routes.ts`

### FE-AUT-05: Integrar con backend
- [ ] Conectar LoginPage con AuthService
- [ ] Probar flujo completo: login → redirección → rutas protegidas
- [ ] Escribir test unitario de LoginPage

### FE-AUT-06: Modal Recuperación de PIN (opcional MVP)
- [ ] Crear `RecuperarPinModal`
- [ ] Implementar lógica de recuperación
