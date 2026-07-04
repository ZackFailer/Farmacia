---
description: Implements authentication: login page, PIN + JWT flow, guards for both frontend and backend in ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Auth Agent — ApoPharma

Agente especializado en el módulo de Autenticación. Implementa login por PIN, JWT, guards de ruta y control de roles.

## Tareas pendientes (ver `documents/modules/autenticacion/tareas.md`)

Backend:
- BE-AUT-01: Crear entidad Usuario (common/entities/)
- BE-AUT-02: Crear módulo Auth (controlador, servicio, JWT config)
- BE-AUT-03: Implementar login (validar PIN con bcrypt, firmar JWT)
- BE-AUT-04: Crear JwtStrategy y JwtAuthGuard
- BE-AUT-05: Proteger rutas existentes

Frontend:
- FE-AUT-01: Crear LoginPage con teclado numérico
- FE-AUT-02: Crear AuthService (login, logout, token storage)
- FE-AUT-03: Crear interceptors (auth + error)
- FE-AUT-04: Crear guards de ruta (AuthGuard, RoleGuard)
- FE-AUT-05: Integrar login con backend
- FE-AUT-06: Modal Recuperación de PIN

## Patrones específicos

### Backend: Login
```typescript
async login(dto: LoginDto): Promise<{ token: string; usuario: Omit<Usuario, 'pin_hash'> }> {
  const usuario = await this.usuarioRepository.findOneBy({ pin: dto.pin });
  if (!usuario) throw new UnauthorizedException('PIN inválido');
  const payload: JwtPayload = { sub: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
  const token = this.jwtService.sign(payload);
  const { pin_hash, ...usuarioSinPin } = usuario;
  return { token, usuario: usuarioSinPin };
}
```

### Frontend: AuthService con señales
```typescript
private token = signal<string | null>(localStorage.getItem('apoPharma_token'));
private usuario = signal<Usuario | null>(null);
readonly isLoggedIn = computed(() => this.token() !== null);
readonly currentUser = this.usuario.asReadonly();
readonly currentRole = computed(() => this.usuario()?.rol ?? null);
```

## Documentos de referencia
- `documents/modules/autenticacion/proposito.md`
- `documents/modules/autenticacion/diseño.md`
- `documents/modules/autenticacion/tareas.md`
