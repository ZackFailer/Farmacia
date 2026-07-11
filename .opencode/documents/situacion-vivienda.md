# Módulo: Situación de Vivienda del Paciente

> **Propósito:** Agregar un estado intermedio de damnificación para pacientes cuya vivienda resultó afectada pero no colapsada completamente durante la emergencia, reemplazando el campo booleano `es_damnificado` por un enum de 3 valores.

---

## 1. Problema Actual

El campo `es_damnificado` es un **booleano** (`true` / `false`) que solo permite clasificar pacientes como damnificados o no damnificados. No existe granularidad para identificar a aquellos cuyas viviendas fueron afectadas parcialmente.

Adicionalmente, el módulo de exportación de censo tiene dos problemas:

1. **Codificación de caracteres**: El CSV se genera sin BOM (`\uFEFF`), por lo que Excel lo interpreta como ANSI y corrompe los acentos (escribe caracteres no legibles).
2. **Formato plano sin hojas**: Todo el censo completo se exporta en un único CSV con secciones separadas por `=== SECCIÓN ===`, lo que no es amigable para el usuario.

---

## 2. Diseño de la Solución

### 2.1 Campo `situacion_vivienda`

Se reemplaza el campo booleano `es_damnificado` por el campo enum de tipo string `situacion_vivienda` con tres valores:

| Valor (DB/API) | Display (UI) | Significado | Reemplaza a |
|---|---|---|---|
| `no_afectado` | No afectado | Vivienda sin daños | `es_damnificado = false` |
| `vivienda_afectada` | Vivienda afectada | Vivienda afectada pero no colapsada | **NUEVO** |
| `damnificado` | Damnificado | Vivienda destruida / colapsada | `es_damnificado = true` |

### 2.2 Nueva exportación XLSX con hojas

Se reemplaza la exportación "Censo Completo" de CSV por **XLSX** usando la librería `exceljs` con 4 hojas estilizadas:

| Hoja | Contenido |
|---|---|
| **Resumen Censo** | Métricas generales, etarias, discapacidad, situación de vivienda, por patología, necesidad y ubicación |
| **Medicamentos** | Top medicamentos dispensados, sin movimientos, totales |
| **Pacientes** | Lista completa con todos los campos y `situacion_vivienda` en texto legible |
| **Dispensaciones** | Historial completo de dispensaciones con medicamentos y dosis |

El CSV "Exportar Estadísticas" se mantiene pero se corrige con BOM.

### 2.3 Migración retrocompatible en SyncQueue

Los items de la cola de sincronización offline que contengan el campo `es_damnificado` (booleano) serán detectados y convertidos automáticamente al nuevo formato al procesarse.

---

## 3. Alcance

### 3.1 Incluye

- Backend: entidad, DTOs (crear/actualizar), enum, service mappings, estadísticas
- Frontend: enum, modelos, services (API + mock), formularios (3 modales), display (8 páginas/modales), tablero estadístico, exportación XLSX, exportación CSV con BOM
- Offline SyncQueue: migrador retrocompatible en `processItems`
- Base de datos: columna migrada automáticamente por TypeORM `synchronize: true`

### 3.2 No incluye

- Migraciones SQL explícitas (TypeORM synchronize cubre desarrollo)
- Modificaciones al menú lateral o guards de ruta
- Cambios en roles de usuario
- Traducciones multi-idioma

---

## 4. Checklist de Implementación

### Fase A — Backend: Enum + Entidad

- [ ] A.1 Crear `apps/backend/src/app/common/enums/situacion-vivienda.enum.ts` con los 3 valores
- [ ] A.2 `paciente.entity.ts`: reemplazar `esDamnificado` (boolean) → `situacionVivienda` (varchar(20), default `'no_afectado'`)

### Fase B — Backend: DTOs + Services

- [ ] B.1 `crear-paciente.dto.ts`: `@IsEnum(SituacionVivienda)` en `CrearPacienteDto` y `CrearPacienteFamiliarDto`
- [ ] B.2 `actualizar-paciente.dto.ts`: `@IsOptional() @IsEnum(SituacionVivienda)`
- [ ] B.3 `pacientes.service.ts`: mapear `situacionVivienda` en create (titular + familiares) y update
- [ ] B.4 `censo.service.ts` — `getEstadisticas()`: agregar `totalNoAfectados`, `totalViviendaAfectada`, `totalDamnificados`
- [ ] B.5 `censo.service.ts` — `exportarCenso()`: mapear `situacionVivienda` en `PacienteExportRow`
- [ ] B.6 `exportar-censo.dto.ts`: `esDamnificado` → `situacionVivienda: string`

### Fase C — Frontend: Enum + Modelos

- [ ] C.1 Crear `apps/frontend/src/app/shared/enums/situacion-vivienda.enum.ts` + `SITUACION_VIVIENDA_LABELS`
- [ ] C.2 `paciente.model.ts`: `Paciente.es_damnificado` → `situacion_vivienda`; `CreatePacienteDto`, `CreateFamiliarDto` igual
- [ ] C.3 `familiar.model.ts`: `es_damnificado` → `situacion_vivienda`
- [ ] C.4 `exportar-censo.model.ts`: `PacienteCsvRow.esDamnificado` → `situacionVivienda`
- [ ] C.5 `censo-estadisticas.model.ts`: agregar `totalNoAfectados`, `totalViviendaAfectada`, `totalDamnificados`

### Fase D — Frontend: Services (API mapping)

- [ ] D.1 `pacientes.service.api.ts`: mapping `situacion_vivienda` ↔ `situacionVivienda`
- [ ] D.2 `dispensacion.service.api.ts`: idem
- [ ] D.3 `historial.service.api.ts`: idem

### Fase E — Frontend: Mock data + Specs

- [ ] E.1 `pacientes.service.mock.ts`: reemplazar `es_damnificado` → `situacion_vivienda` en seed data + mappings
- [ ] E.2 `dispensacion.service.mock.ts`: idem
- [ ] E.3 `historial.service.mock.ts`: idem
- [ ] E.4 `dispensacion.service.spec.ts`: idem

### Fase F — Frontend: Formularios (modales)

- [ ] F.1 `registro-paciente.modal.ts`: select con 3 opciones usando `SITUACION_VIVIENDA_LABELS`; eliminar `onFamiliarDamnificadoChange` si no se necesita
- [ ] F.2 `editar-paciente.modal.ts`: idem
- [ ] F.3 `registrar-paciente-carpa.modal.ts`: idem

### Fase G — Frontend: Visualización

- [ ] G.1 `detalle-paciente.page.ts`: display con label legible + familiar
- [ ] G.2 `lista-pacientes.page.ts`: si se muestra, actualizar
- [ ] G.3 `dispensacion.page.ts`: display paciente + familiar
- [ ] G.4 `confirmar-entrega.page.ts`: display paciente
- [ ] G.5 `historial-paciente.page.ts`: display paciente
- [ ] G.6 `detalle-carpa.page.ts`: si se muestra, actualizar
- [ ] G.7 `confirmacion-entrega.modal.ts`: display paciente
- [ ] G.8 `detalle-dispensacion.modal.ts`: display paciente

### Fase H — Frontend: Exportación XLSX

- [ ] H.1 Agregar `exceljs` al `package.json` del frontend
- [ ] H.2 Crear `apps/frontend/src/app/core/services/excel-export.service.ts` con:
  - [ ] Hoja "Resumen Censo" con métricas + situación de vivienda
  - [ ] Hoja "Medicamentos" con top dispensados + sin movimientos
  - [ ] Hoja "Pacientes" con todos los campos + `situacion_vivienda` legible
  - [ ] Hoja "Dispensaciones" con historial completo
  - [ ] Cabeceras en negrita, colores, anchos de columna automáticos
- [ ] H.3 `tablero.page.ts`: reemplazar `generarCsvCompleto()` por `generarExcelCompleto()` usando el nuevo servicio
- [ ] H.4 `tablero.page.ts`: agregar BOM `\uFEFF` al CSV simple de "Exportar Estadísticas"
- [ ] H.5 `tablero.page.ts`: agregar nuevo card "Situación de Vivienda" con los 3 conteos

### Fase I — Offline Sync: Migración retrocompatible

- [ ] I.1 `sync-queue.service.ts` en `processItems()`: detectar DTO con `es_damnificado` (booleano) y convertir a `situacion_vivienda`

### Fase J — Verificación

- [ ] J.1 Build frontend (`npx nx build frontend --configuration=development`)
- [ ] J.2 Lint frontend (`npx nx lint frontend`)
- [ ] J.3 Build backend (`npx nx build backend`)
- [ ] J.4 Lint backend (`npx nx lint backend`)
- [ ] J.5 Tests frontend (`npx nx test frontend`)
- [ ] J.6 Tests backend (`npx nx test backend`)

---

## 5. Dependencias

| Paquete | Versión | Propósito |
|---|---|---|
| `exceljs` | ^4.4 | Generación de XLSX con estilos, múltiples hojas y UTF-8 nativo |

Se agrega al `package.json` del workspace raíz o del frontend (verificar política existente; lo más probable es raíz ya que Nx maneja dependencias globalmente).

---

## 6. Estimación de archivos

| Categoría | Cantidad |
|---|---|
| Archivos nuevos | 4 (enum backend, enum frontend, situacion-vivienda.enum.ts, excel-export.service.ts, este .md) |
| Archivos modificados | ~22-24 (entidad, DTOs, services, modelos, modales, páginas, mocks, specs, tablero, sync-queue) |
| Verificación | 6 comandos |

**Total**: ~26-28 archivos.

---

## 7. Notas técnicas

### 7.1 Migración automática en DB

TypeORM con `synchronize: true` eliminará la columna `es_damnificado` y creará `situacion_vivienda`. Para preservar datos existentes durante desarrollo, se puede ejecutar un script manual:

```sql
ALTER TABLE paciente ADD COLUMN situacion_vivienda TEXT DEFAULT 'no_afectado';
UPDATE paciente SET situacion_vivienda = 'damnificado' WHERE es_damnificado = 1;
```

O esperar al seed que crea pacientes con el nuevo formato.

### 7.2 API Contract

El JSON que viaja entre frontend y backend usará `situacionVivienda` (camelCase). Los valores serán strings: `'no_afectado'`, `'vivienda_afectada'`, `'damnificado'`.

### 7.3 Display helper

Los labels legibles se definen en el enum frontend:

```typescript
export const SITUACION_VIVIENDA_LABELS: Record<SituacionVivienda, string> = {
  [SituacionVivienda.NO_AFECTADO]: 'No afectado',
  [SituacionVivienda.VIVIENDA_AFECTADA]: 'Vivienda afectada',
  [SituacionVivienda.DAMNIFICADO]: 'Damnificado',
};
```

### 7.4 XLSX con exceljs

El servicio `ExcelExportService` usará el patrón:

```typescript
import * as ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Resumen Censo');

sheet.columns = [
  { header: 'Métrica', key: 'metrica', width: 30 },
  { header: 'Valor', key: 'valor', width: 15 },
];

sheet.getRow(1).font = { bold: true };

// BOM automático con writeBuffer
const buffer = await workbook.xlsx.writeBuffer();
```

### 7.5 BOM para CSV

```typescript
const bom = '\uFEFF';
const csvContent = bom + lines.join('\r\n');
```
