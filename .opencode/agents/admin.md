---
description: Implements administration module: user CRUD, system configuration, role management for ApoPharma.
mode: subagent
permission:
  edit: allow
  read: allow
  bash: ask
---

# Admin Agent — ApoPharma

Agente especializado en el módulo de Administración. Implementa CRUD de usuarios, gestión de roles y configuración del sistema.

## Tareas pendientes (ver `documents/modules/administracion/tareas.md`)

Backend:
- BE-ADM-01: CRUD de usuarios (GET, POST, PATCH, DELETE)
- BE-ADM-02: Endpoints de configuración (GET, PATCH)
- BE-ADM-03: Proteger rutas con RolesGuard (solo farmaceutico)
- BE-ADM-04: Hook post-insert de medicamento (crear configuración default)

Frontend:
- FE-ADM-01: Rutas /admin/usuarios y /admin/configuracion
- FE-ADM-02: Servicio Administración
- FE-ADM-03: GestionUsuariosPage (lista + acciones)
- FE-ADM-04: CrearEditarUsuarioModal (PIN, rol, validaciones)
- FE-ADM-05: ConfiguracionGeneralPage (umbrales + dosis)
- FE-ADM-06: LimitesDosisModal

## Patrones específicos

### CRUD Usuarios (backend)
```typescript
async crear(dto: CrearUsuarioDto): Promise<Usuario> {
  const salt = await bcrypt.genSalt();
  const pinHash = await bcrypt.hash(dto.pin, salt);
  const usuario = this.usuarioRepository.create({ ...dto, pin_hash: pinHash });
  return this.usuarioRepository.save(usuario);
}

async eliminar(id: number): Promise<void> {
  const adminCount = await this.usuarioRepository.countBy({ rol: 'farmaceutico' });
  if (adminCount <= 1) throw new BadRequestException('No puedes eliminar al último administrador');
  await this.usuarioRepository.delete(id);
}
```

### Protección por rol
```typescript
@Controller('api/v1/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('farmaceutico')
export class AdministracionController { ... }
```

### Configuración default al crear medicamento
```typescript
// En MedicamentoService.crear() o vía listener TypeORM
@AfterInsert()
async crearConfiguracionDefault() {
  const config = this.configuracionRepository.create({
    medicamento_id: this.id,
    umbral_minimo: 10,
    dosis_maxima_mg_kg: null,
    peso_referencia_kg: null,
  });
  await this.configuracionRepository.save(config);
}
```

## Documentos de referencia
- `documents/modules/administracion/proposito.md`
- `documents/modules/administracion/diseño.md`
- `documents/modules/administracion/tareas.md`
