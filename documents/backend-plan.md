# Plan de Implementación — Backend (NestJS 11)

## 1. Stack y Herramientas

| Concepto | Decisión |
|---|---|
| Framework | NestJS 11 |
| ORM | TypeORM |
| Base de datos | SQLite (local/embebido, sin dependencia externa) |
| Autenticación | PIN + JWT (`@nestjs/jwt`, `@nestjs/passport`) |
| Validación | `class-validator` + `class-transformer` |
| Documentación API | Swagger (`@nestjs/swagger`) |
| Test | Jest + ts-jest |
| E2E | Jest + Axios |
| Compilación | Webpack + TSC |

## 2. Estructura de Archivos por Módulo

```
src/app/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.service.spec.ts
│   ├── dto/
│   │   └── login.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
│
├── recepcion/
│   ├── recepcion.module.ts
│   ├── recepcion.controller.ts
│   ├── recepcion.service.ts
│   ├── recepcion.service.spec.ts
│   ├── dto/
│   │   ├── crear-lote.dto.ts
│   │   └── crear-medicamento.dto.ts
│   └── guards/  (roles)
│
├── inventario/
│   ├── inventario.module.ts
│   ├── inventario.controller.ts
│   ├── inventario.service.ts
│   ├── inventario.service.spec.ts
│   ├── dto/
│   │   ├── ajustar-stock.dto.ts
│   │   └── actualizar-umbral.dto.ts
│   └── guards/
│
├── dispensacion/
│   ├── dispensacion.module.ts
│   ├── dispensacion.controller.ts
│   ├── dispensacion.service.ts
│   ├── dispensacion.service.spec.ts
│   ├── dto/
│   │   ├── crear-paciente.dto.ts
│   │   ├── crear-dispensacion.dto.ts
│   │   └── crear-dispensacion-detalle.dto.ts
│   └── guards/
│
├── historial/
│   ├── historial.module.ts
│   ├── historial.controller.ts
│   ├── historial.service.ts
│   ├── historial.service.spec.ts
│   └── dto/  (solo response, read-only)
│
├── administracion/
│   ├── administracion.module.ts
│   ├── administracion.controller.ts
│   ├── administracion.service.ts
│   ├── administracion.service.spec.ts
│   ├── dto/
│   │   ├── crear-usuario.dto.ts
│   │   ├── actualizar-usuario.dto.ts
│   │   └── actualizar-configuracion.dto.ts
│   └── guards/
│       └── roles.guard.ts
│
├── common/
│   ├── entities/
│   │   ├── medicamento.entity.ts
│   │   ├── lote.entity.ts
│   │   ├── paciente.entity.ts
│   │   ├── dispensacion.entity.ts
│   │   ├── dispensacion-detalle.entity.ts
│   │   ├── usuario.entity.ts
│   │   └── configuracion.entity.ts
│   ├── decorators/
│   │   ├── roles.decorator.ts
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   └── filters/
│       └── http-exception.filter.ts
│
├── app.module.ts       (importa todos los módulos funcionales)
├── app.controller.ts
└── app.service.ts
```

## 3. Entidades TypeORM

Cada entidad se mapea a su tabla correspondiente.

### Relaciones Clave
- `Lote` N:1 `Medicamento`
- `DispensacionDetalle` N:1 `Dispensacion`, N:1 `Lote`, N:1 `Medicamento`
- `Dispensacion` N:1 `Paciente`, N:1 `Usuario`
- `Configuracion` 1:1 `Medicamento`

### Índices
- `lote.codigo_qr` UNIQUE
- `paciente.id_emergencia` UNIQUE
- `dispensacion.fecha_hora` DESC (para consultas de historial)

## 4. Endpoints por Módulo

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/login` | Autenticar usuario, retorna JWT |

### Recepción
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/medicamentos` | Listar medicamentos (autocompletado) |
| POST | `/api/v1/medicamentos` | Crear medicamento |
| GET | `/api/v1/lotes` | Listar ingresos recientes |
| POST | `/api/v1/lotes` | Crear lote + generar código QR |
| GET | `/api/v1/lotes/:id` | Detalle de lote |
| GET | `/api/v1/lotes/:id/qr` | Obtener QR del lote |

### Inventario
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/inventario` | Stock general con semáforo y filtros |
| GET | `/api/v1/inventario/proximos-vencer` | Lotes próximos a vencer |
| PATCH | `/api/v1/lotes/:id/ajustar-stock` | Conteo físico (ajuste) |
| GET | `/api/v1/configuraciones/umbrales` | Listar umbrales |
| PATCH | `/api/v1/configuraciones/:id/umbral` | Actualizar umbral |

### Dispensación
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/pacientes` | Registrar paciente de emergencia |
| GET | `/api/v1/pacientes/:idEmergencia` | Buscar paciente por ID |
| GET | `/api/v1/medicamentos?search=` | Buscar medicamentos |
| GET | `/api/v1/lotes/disponibles/:medicamentoId` | Lotes disponibles de un medicamento |
| GET | `/api/v1/configuraciones/:medicamentoId/dosis` | Obtener límite de dosis |
| POST | `/api/v1/dispensaciones` | Crear dispensación (descuenta stock) |

### Historial
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/pacientes/:idEmergencia/dispensaciones` | Historial de dispensaciones |
| GET | `/api/v1/dispensaciones/:id` | Detalle de dispensación |

### Administración
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/usuarios` | Listar usuarios |
| POST | `/api/v1/usuarios` | Crear usuario |
| PATCH | `/api/v1/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/v1/usuarios/:id` | Eliminar usuario |
| GET | `/api/v1/configuraciones` | Listar configuraciones |
| PATCH | `/api/v1/configuraciones/:id` | Actualizar configuración |

## 5. Autenticación

### Flujo
1. Usuario ingresa PIN en pantalla de login
2. Backend busca usuario por PIN + rol, genera JWT
3. Frontend almacena token en `localStorage`
4. `JwtAuthGuard` protege todas las rutas excepto `/auth/login`
5. `RolesGuard` verifica rol en rutas de administración

### JWT Payload
```json
{
  "sub": "usuario_id",
  "nombre": "...",
  "rol": "farmaceutico | despachador",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 6. Base de Datos (SQLite)

- Configuración en `app.module.ts` con TypeORM `forRoot()`
- `synchronize: true` en desarrollo (genera tablas automáticamente)
- Base de datos guardada en `apps/backend/data/farmacia.sqlite`
- Migraciones manuales para producción

## 7. Manejo de Errores

```typescript
// HttpExceptionFilter global
@Catch(HttpException)
catch(exception: HttpException, host: ArgumentsHost) {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<Response>();
  const status = exception.getStatus();
  response.status(status).json({
    error: exception.message,
    statusCode: status,
    timestamp: new Date().toISOString(),
  });
}
```

## 8. Validación de Dosis (Lógica de Negocio)

Servicio `DispensacionService.validarDosis(medicamentoId, pesoKg, dosisMg)`:
1. Buscar `configuracion` por `medicamentoId`
2. Si no existe configuración -> retorna `{ valido: true }` (sin restricción)
3. Calcular dosisReal = dosisMg / pesoKg
4. Si dosisReal > configuracion.dosis_maxima_mg_kg -> retorna `{ valido: false, calculado: dosisReal, maximo: configuracion.dosis_maxima_mg_kg }`
5. Si no -> retorna `{ valido: true }`
