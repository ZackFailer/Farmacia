# Módulo de Administración — Diseño

## Pantallas

### 1. Gestión de Usuarios (`/admin/usuarios`)

```
┌─────────────────────────────┐
│  ← Volver    Administración │
├─────────────────────────────┤
│ [+ Nuevo Usuario]           │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ María López             │ │
│ │ Rol: Farmacéutico       │ │
│ │ [Editar] [Eliminar]     │ │
│ ├─────────────────────────┤ │
│ │ Carlos Ruiz             │ │
│ │ Rol: Despachador        │ │
│ │ [Editar] [Eliminar]     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Modal Creación/Edición de Usuario

```
┌─ Crear Usuario ────────────┐
│                             │
│ Nombre * [________________]│
│ Rol *     [Farmacéutico ▼] │
│ PIN *     [●] [●] [●] [●]  │
│ Confirmar PIN * [●] [●] [●]│
│                             │
│   [Cancelar] [Guardar]     │
└─────────────────────────────┘
```

### 2. Configuración General (`/admin/configuracion`)

```
┌─────────────────────────────┐
│  ← Volver   Configuración   │
├─────────────────────────────┤
│ Umbrales de Stock           │
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 500mg       │ │
│ │ Umbral: 100 unds        │ │
│ │ [Editar umbral]         │ │
│ ├─────────────────────────┤ │
│ │ Insulina NPH 100UI     │ │
│ │ Umbral: 50 unds         │ │
│ │ [Editar umbral]         │ │
│ └─────────────────────────┘ │
│                             │
│ Límites de Dosis            │
│ ┌─────────────────────────┐ │
│ │ Amoxicilina 250mg/5ml   │ │
│ │ Dosis máx: 10 mg/kg     │ │
│ │ Peso ref: 70 kg         │ │
│ │ [Editar límite]         │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Modal Edición de Límites de Dosis

```
┌─ Límite de Dosis ──────────┐
│                             │
│ Medicamento: Amoxicilina    │
│                             │
│ Dosis máxima (mg/kg) * [__]│
│ Peso de referencia (kg) [_]│
│                             │
│   [Cancelar] [Guardar]     │
└─────────────────────────────┘
```

## Componentes Frontend

| Componente | Tipo | Descripción |
|---|---|---|
| `GestionUsuariosPage` | Page | Lista de usuarios con CRUD |
| `ConfiguracionGeneralPage` | Page | Configuración de umbrales y dosis |
| `CrearEditarUsuarioModal` | Modal | Formulario de creación/edición de usuario |
| `LimitesDosisModal` | Modal | Configurar dosis máxima por kg |

## API Backend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/usuarios` | Listar todos los usuarios |
| POST | `/api/v1/usuarios` | Crear usuario |
| PATCH | `/api/v1/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/v1/usuarios/:id` | Eliminar usuario |
| GET | `/api/v1/configuraciones` | Listar configuraciones (umbrales + dosis) |
| PATCH | `/api/v1/configuraciones/:id` | Actualizar configuración |

## Reglas de Negocio

1. **PIN**: 4-6 dígitos numéricos, almacenado con bcrypt.
2. **Último admin**: No se permite eliminar si es el único usuario con rol farmaceutico.
3. **Umbrales**: Se crea automáticamente un registro en `configuracion` para cada nuevo medicamento con valor por defecto (ej: 10).
4. **Límites de dosis**: Configuración opcional, si es NULL no se valida dosis para ese medicamento.
