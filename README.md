# ApoPharma — Sistema de Gestión de Farmacia de Emergencia

Monorepo para digitalizar la gestión de insumos y la dispensación de medicamentos en una farmacia de campaña. Reemplaza el registro en papel por un flujo ágil basado en escaneo QR, mantiene el inventario actualizado en tiempo real y permite un control mínimo pero seguro sobre la entrega de fármacos a los pacientes.

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 21 (standalone) + Ionic 8 |
| **Backend** | NestJS 11 + TypeORM |
| **Base de datos** | SQLite via `node:sqlite` nativo (sin dependencias externas) |
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

## Primeros pasos (para no técnicas)

### Requisitos
- Una PC con Windows 10 u 11
- Conexión WiFi (la misma red que los celulares que usarán la app)
- Node.js **22+** — [descargar aquí](https://nodejs.org) (requerido para `node:sqlite` nativo)

### 1. Preparar la PC (solo la primera vez)

Abrir **PowerShell** (clic derecho → "Ejecutar como administrador") y escribir:

```powershell
cd C:\farmacia\Farmacia-master\Farmacia-master
npm install
npx nx build backend
npx nx build frontend
```

### 2. Iniciar el servidor (todos los días)

Abrir **PowerShell** (sin necesidad de administrador):

```powershell
cd C:\farmacia\Farmacia-master\Farmacia-master
npx nx serve backend          # usa --experimental-sqlite automáticamente
```

Aparecerá: `🚀 Application is running on: https://localhost:3000/api/v1`

### 3. Conectarse desde cualquier dispositivo

1. **Obtener la IP de la PC**: en PowerShell ejecutar `ipconfig`. Copiar el número que dice `Dirección IPv4` (ej: `192.168.0.112`).
2. **En el celular**: abrir Chrome o Safari e ingresar `https://192.168.0.112:3000` (usar la IP real).
3. **Aceptar la advertencia**: el navegador dirá "Conexión no segura" — tocar **"Avanzado" → "Continuar igual"**.
4. **Iniciar sesión**: PIN `123456` (usuario administrador).

> ⚠️ El escáner QR requiere HTTPS. Si ves la pantalla en blanco, asegúrate de usar `https://` y no `http://`.

### 4. Detener el servidor

Presionar `Ctrl + C` en la ventana de PowerShell donde está corriendo.

---

## Base de Datos

Ubicación: `apps/backend/data/farmacia.sqlite` (persistente entre builds, no se borra al recompilar).

### 18 tablas

| Tabla | Propósito |
|---|---|
| `medicamento` | Catálogo de medicamentos |
| `lote` | Lotes con código QR, stock, vencimiento |
| `lote_movimiento` | Movimientos de stock por lote (ingreso, ajuste, egreso) |
| `paciente` | Registro mínimo de pacientes de emergencia |
| `nucleo_familiar` | Grupo familiar asociado a un titular |
| `nucleo_familiar_miembro` | Miembros del núcleo familiar con relación |
| `receta` | Cabecera de receta médica |
| `receta_detalle` | Items de cada receta |
| `dispensacion` | Cabecera de cada entrega |
| `dispensacion_detalle` | Items de cada dispensación |
| `usuario` | Usuarios del sistema con PIN y rol |
| `configuracion` | Umbrales de stock y límites de dosis |
| `carpa` | Carpa censal (ubicación, capacidad) |
| `carpa_paciente` | Asignación paciente ↔ carpa |
| `catalogo_patologia` | Catálogo de patologías |
| `catalogo_necesidad` | Catálogo de necesidades |
| `paciente_patologia` | Patologías por paciente |
| `paciente_necesidad` | Necesidades por paciente (con trazabilidad de cumplimiento)

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

### Desarrollo

```sh
# Frontend
npx nx serve frontend                      # http://localhost:4200
npx nx build frontend                      # Producción
npx nx build frontend --configuration=development
npx nx test frontend
npx nx lint frontend
npx nx e2e frontend-e2e

# Backend
npx nx serve backend                       # https://localhost:3000 (usa --experimental-sqlite)
npx nx build backend
npx nx test backend
npx nx lint backend
npx nx e2e backend-e2e
```

### Producción (PM2)

El servidor se sirve completo desde un solo proceso en el puerto 3000.

```sh
# Iniciar
pm2 start ecosystem.config.js

# Verificar estado
pm2 status

# Ver logs
pm2 logs apopharma-backend

# Detener
pm2 stop apopharma-backend

# Reiniciar (ej: después de actualizar código)
pm2 restart apopharma-backend
```

### Inicio automático al encender la PC

Ejecutar **una vez como Administrador**:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\farmacia\Farmacia-master\Farmacia-master\scripts\register-pm2-startup.ps1"
```

### Actualizar después de cambios

```sh
npx nx build backend
npx nx build frontend
pm2 restart apopharma-backend
```

## Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| Pantalla en blanco en el celular | Accediendo por HTTP en vez de HTTPS | Usar `https://` en la URL |
| Escáner QR no funciona | No hay HTTPS | Asegurar que la URL empiece con `https://` |
| "No se puede acceder al sitio" | Red diferente o PC apagada | Verificar misma WiFi y que el servidor esté corriendo |
| `EADDRINUSE` al iniciar | Puerto 3000 ocupado | `pm2 stop apopharma-backend` y volver a iniciar |
| Contenido se sale de la pantalla | Viewport incorrecto | Ya corregido (usa `100dvh`) |

Ver `AGENTS.md` para la lista completa de comandos y el uso de los agentes opencode.
