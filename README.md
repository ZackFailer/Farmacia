# ApoPharma — Sistema de Gestión de Farmacia de Emergencia

Monorepo para digitalizar la gestión de insumos y la dispensación de medicamentos en una farmacia de campaña. Reemplaza el registro en papel por un flujo ágil basado en escaneo QR, mantiene el inventario actualizado en tiempo real y permite un control mínimo pero seguro sobre la entrega de fármacos a los pacientes.

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 21 (standalone) + Ionic 8 |
| **Backend** | NestJS 11 + TypeORM |
| **Base de datos** | SQLite (embebida, sin servidor) |
| **Lenguaje** | TypeScript ~5.9 (strict) |
| **Monorepo** | Nx 23 |
| **Estilos** | SCSS |
| **Test unitarios (FE)** | Vitest |
| **Test unitarios (BE)** | Jest + ts-jest |
| **E2E (FE)** | Playwright |
| **E2E (BE)** | Jest + Axios |
| **Linter** | ESLint v9 (flat config) |
| **Formateo** | Prettier |

## Propósito

El sistema está diseñado para **equipos humanitarios** que operan farmacias de emergencia en terreno. Su objetivo es:

1. **Recepcionar donaciones** — registrar lotes de medicamentos con etiquetado QR para trazabilidad total.
2. **Mantener inventario perpetuo** — con descuento automático al dispensar, alertas de stock bajo y conteo físico para ajustes.
3. **Dispensar medicamentos** — mediante flujo guiado por escaneo QR del paciente y del lote, con validación básica de dosis.
4. **Historial por paciente** — registrar entregas anteriores asociadas a un ID de emergencia.
5. **Administrar el sistema** — gestión de usuarios, roles, umbrales de stock y límites de dosis.

## Alcance

### Incluye
- Registro de lotes con código QR único y ubicación física
- Control de stock automático con alertas de umbral bajo y vencimiento próximo
- Registro rápido de pacientes de emergencia con marcación "damnificado"
- Dispensación con escaneo de paciente y lote, validación de dosis y registro de entregas
- Conteo físico para ajustar inventario
- Historial de dispensaciones por paciente
- Autenticación por PIN y control de roles (farmacéutico, despachador)

### Fuera de alcance
- Valor monetario de donaciones o gestión contable
- Expediente médico completo, diagnóstico o prescripción electrónica
- Detección de interacciones medicamentosas complejas
- Órdenes de compra automáticas
- Proyecciones de consumo avanzadas

## Arquitectura

```
Farmacia/
├── apps/
│   ├── frontend/                    Angular 21 + Ionic 8 (standalone)
│   │   └── src/app/
│   │       ├── auth/                Inicio de sesión
│   │       ├── recepcion/           Dashboard de ingresos + modales
│   │       ├── inventario/          Panel de stock + umbrales
│   │       ├── dispensacion/        Flujo de 3 pasos (escanear → seleccionar → confirmar)
│   │       ├── historial/           Historial de paciente
│   │       ├── administracion/      Usuarios y configuración
│   │       ├── shared/              Componentes, pipes y modelos compartidos
│   │       └── core/                Interceptors, guards y servicios singleton
│   │
│   ├── backend/                     NestJS 11
│   │   └── src/app/
│   │       ├── auth/                Login + JWT
│   │       ├── recepcion/           CRUD lotes y medicamentos
│   │       ├── inventario/          Stock, ajustes, umbrales
│   │       ├── dispensacion/        Pacientes, dispensación, validación dosis
│   │       ├── historial/           Consulta de dispensaciones
│   │       ├── administracion/      CRUD usuarios y configuración
│   │       └── common/              Entidades, guards, decoradores
│   │
│   ├── frontend-e2e/               Playwright
│   └── backend-e2e/                Jest + Axios
│
├── documents/                       Planes detallados por módulo
│   ├── base.md                      Referencia general de arquitectura
│   ├── frontend-plan.md             Plan de implementación frontend
│   ├── backend-plan.md              Plan de implementación backend
│   └── modules/                     Propósito, diseño y tareas por módulo
│       ├── autenticacion/
│       ├── recepcion/
│       ├── inventario/
│       ├── dispensacion/
│       ├── historial/
│       └── administracion/
│
├── .opencode/                       Agentes opencode para el proyecto
│   └── agents/                      Definiciones de agentes especializados
│
├── nx.json
├── eslint.config.mjs
├── tsconfig.base.json
└── package.json
```

## Base de Datos (7 tablas)

| Tabla | Propósito |
|---|---|
| `medicamento` | Catálogo de medicamentos |
| `lote` | Lotes con código QR, stock, vencimiento |
| `paciente` | Registro mínimo de pacientes de emergencia |
| `dispensacion` | Cabecera de cada entrega |
| `dispensacion_detalle` | Items de cada dispensación |
| `usuario` | Usuarios del sistema con PIN y rol |
| `configuracion` | Umbrales de stock y límites de dosis |

## Módulos Funcionales

| Módulo | Pantallas | Modales |
|---|---|---|
| **Autenticación** | Login | Recuperación de PIN |
| **Recepción** | Dashboard de Ingresos | Ingreso Lote, Nuevo Medicamento, Impresión QR |
| **Inventario** | Panel Stock General, Config. Umbrales | Ajuste Stock, Detalle Lote, Alerta Stock, Editar Umbral |
| **Dispensación** | Paso 1-2-3 (flujo guiado) | Registro Paciente, Búsqueda Paciente/Medicamento, Validación Dosis, Confirmación |
| **Historial** | Historial de Paciente | Detalle Dispensación |
| **Administración** | Gestión Usuarios, Config. General | Crear/Editar Usuario, Límites Dosis |

## Comandos

```sh
# Frontend
npx nx serve frontend                      # http://localhost:4200
npx nx build frontend                      # Producción
npx nx build frontend --configuration=development
npx nx test frontend
npx nx lint frontend
npx nx e2e frontend-e2e

# Backend
npx nx serve backend                       # http://localhost:3000/api
npx nx build backend
npx nx test backend
npx nx lint backend
npx nx e2e backend-e2e
```

Ver `AGENTS.md` para la lista completa de comandos y el uso de los agentes opencode.
