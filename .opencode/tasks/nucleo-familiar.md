# Plan: Reemplazar `paciente_familiar` por `nucleo_familiar`

> **Propósito**: Crear una tabla intermedia `nucleo_familiar` que relacione pacientes en un grupo familiar simétrico. Al buscar cualquier paciente, se debe poder ver el núcleo familiar completo (todos los miembros), no solo los dependientes directos del titular.

---

## Fase 1 — Backend: Crear entidades nuevas (2 crear, 1 eliminar)

### Tarea 1.1: Eliminar `PacienteFamiliar`
- [ ] Eliminar archivo `apps/backend/src/app/common/entities/paciente-familiar.entity.ts`

### Tarea 1.2: Crear `NucleoFamiliar`
- [ ] Crear `apps/backend/src/app/common/entities/nucleo-familiar.entity.ts`
  - `id` PK
  - `titularId` int (FK a paciente — quien registró el núcleo)
  - `@OneToMany(() => NucleoFamiliarMiembro, (m) => m.nucleo, { cascade: true })`
  - `createdAt` (CreateDateColumn)

### Tarea 1.3: Crear `NucleoFamiliarMiembro`
- [ ] Crear `apps/backend/src/app/common/entities/nucleo-familiar-miembro.entity.ts`
  - `id` PK
  - `nucleoId` int FK → `nucleo_familiar`
  - `pacienteId` int FK → `paciente` (con `unique: true` — un paciente solo pertenece a un núcleo)
  - `relacion` varchar(30) — "Hijo/a", "Cónyuge", "Titular", etc. desde la perspectiva del titular
  - `@ManyToOne(() => NucleoFamiliar)` con CASCADE
  - `@ManyToOne(() => Paciente)` con `@JoinColumn`

---

## Fase 2 — Backend: Actualizar `Paciente` entity

### Tarea 2.1: Modificar `paciente.entity.ts`
- [ ] Quitar `import { PacienteFamiliar }` y `import { Familiar }`
- [ ] Agregar `import { NucleoFamiliarMiembro }`
- [ ] Reemplazar:
  ```typescript
  @OneToMany(() => PacienteFamiliar, (pf) => pf.paciente, { cascade: true })
  familiares!: PacienteFamiliar[];
  ```
  Por:
  ```typescript
  @OneToMany(() => NucleoFamiliarMiembro, (m) => m.paciente)
  familiares!: NucleoFamiliarMiembro[];
  ```
- [ ] Mantener `tieneCargaFamiliar` como booleano

---

## Fase 3 — Backend: Actualizar módulos

### Tarea 3.1: `app.module.ts`
- [ ] Agregar `NucleoFamiliar` y `NucleoFamiliarMiembro` al array `entities` de `TypeOrmModule.forRoot()`

### Tarea 3.2: `dispensacion.module.ts`
- [ ] Agregar ambas entidades a `TypeOrmModule.forFeature([...])`

---

## Fase 4 — Backend: Actualizar DTO

### Tarea 4.1: `crear-paciente.dto.ts`
- [ ] `CrearPacienteFamiliarDto` se mantiene igual
- [ ] `CrearPacienteDto`: mantener `tieneCargaFamiliar` como booleano opcional (flag de UI)
- [ ] Si `familiares.length > 0`, el servicio creará el núcleo automáticamente

---

## Fase 5 — Backend: Actualizar `DispensacionService`

### Tarea 5.1: Nuevo helper `generateNextEmergenciaId()`
- [ ] Ya existe — reutilizar

### Tarea 5.2: Nuevo helper `loadPacienteConNucleo()`
```typescript
private async loadPacienteConNucleo(id: number) {
  return this.pacienteRepository.findOne({
    where: { id },
    relations: {
      nucleo: { miembros: { paciente: true } },
    },
  });
}
```
- [ ] Crear método

### Tarea 5.3: Actualizar `createPaciente()`
```
1. Crear paciente principal (titular)
2. Si hay familiares:
   a. Crear NucleoFamiliar con titularId = saved.id, guardar
   b. Guardar cada familiar como Paciente completo
   c. Crear NucleoFamiliarMiembro para cada familiar
   d. Crear NucleoFamiliarMiembro para el titular (relacion = "Titular")
3. Retornar loadPacienteConNucleo(saved.id)
```

### Tarea 5.4: Actualizar `getPacienteByIdEmergencia()`
- [ ] Reemplazar `relations: { familiares: { familiar: true } }` por el nuevo helper

### Tarea 5.5: Actualizar `getFamiliares()`
```
1. Buscar NucleoFamiliarMiembro donde pacienteId = :id
2. Obtener el nucleoId
3. Buscar todos los miembros con ese nucleoId, con paciente relation
4. Retornar array de pacientes con relacion (excluyendo al propio)
```

### Tarea 5.6: Actualizar `searchPacientes()`
- [ ] Incluir join a `nucleo.miembros.paciente` para que los resultados incluyan el núcleo

### Tarea 5.7: Importar nuevas entidades, remover `PacienteFamiliar`
- [ ] Quitar `import { PacienteFamiliar }`
- [ ] Agregar imports de las nuevas entidades
- [ ] Quitar `@InjectRepository(PacienteFamiliar)` (ya no se necesita)

---

## Fase 6 — Frontend: Modelos

### Tarea 6.1: `familiar.model.ts`
- [ ] Agregar campo opcional `es_titular?: boolean`
- [ ] El resto se mantiene igual (Paciente + relacion)

### Tarea 6.2: `paciente.model.ts`
- [ ] Agregar `es_titular?: boolean`
- [ ] Mantener o quitar `tiene_carga_familiar` (opcional, flag de UI)

### Tarea 6.3: (Opcional) `nucleo-familiar.model.ts`
- [ ] Crear interfaz `NucleoFamiliar` si se requiere en frontend

---

## Fase 7 — Frontend: Mock Service

### Tarea 7.1: `dispensacion.service.mock.ts`
- [ ] Reemplazar `FamiliarLink[]` por estructura de núcleo:
  ```typescript
  interface NucleoSeed {
    id: number;
    titularId: number;
    miembros: { pacienteId: number; relacion: string }[];
  }
  ```
- [ ] Seed data:
  - Núcleo 1: Juan (titular) + Lucía (Hijo/a) + Sofía (Hijo/a)
  - Núcleo 2: Pedro (titular) + Ana (Cónyuge)
- [ ] `buildFamiliares()`: buscar núcleo del paciente, devolver todos los miembros excepto él mismo, con `relacion` y `es_titular`
- [ ] `registrarPaciente()`: si hay familiares, crear núcleo, guardar todos como pacientes, crear miembros

---

## Fase 8 — Frontend: API Service

### Tarea 8.1: `dispensacion.service.api.ts`
- [ ] Reemplazar `ApiPacienteFamiliar` por `ApiNucleoMiembro`:
  ```typescript
  interface ApiNucleoMiembro {
    id: number;
    nucleoId: number;
    pacienteId: number;
    relacion: string;
    paciente: ApiPaciente;  // datos completos
  }
  ```
- [ ] Reemplazar `ApiPaciente.familiares?: ApiPacienteFamiliar[]` por `ApiPaciente.nucleo?: { miembros: ApiNucleoMiembro[] }`
- [ ] `toPaciente()`: mapear `nucleo.miembros` como `familiares[]`, cada uno con datos completos del paciente + `relacion` + `es_titular`

---

## Fase 9 — Frontend: UI

### Tarea 9.1: `registro-paciente.modal.ts`
- [ ] Mantener formulario actual (ya captura todos los campos de paciente + relacion)
- [ ] El toggle `tieneCargaFamiliar` se puede mantener o eliminar — los familiares se envían si `familiares.length > 0`

### Tarea 9.2: `paso1-escanear-paciente.page.ts`
- [ ] Al mostrar el paciente, indicar quién es el titular:
  ```
  @if (p.es_titular) { <ion-note>Titular del núcleo familiar</ion-note> }
  ```
- [ ] En la lista de familiares, mostrar `relacion` + todos los datos del paciente

### Tarea 9.3: `busqueda-paciente.modal.ts`
- [ ] Al mostrar resultados, si el paciente tiene núcleo, mostrar todos los miembros

---

## Fase 10 — Verificación

### Tarea 10.1: Backend
- [ ] `npx nx build backend` → debe compilar sin errores
- [ ] `npx nx test backend` → 6 tests pasan
- [ ] `npx nx lint backend` → sin warnings nuevos

### Tarea 10.2: Frontend
- [ ] `npx nx build frontend` → debe compilar sin errores
- [ ] `npx nx test frontend` → 38 tests pasan
- [ ] `npx nx lint frontend` → sin errores nuevos (pre-existentes están OK)

---

## Resumen de archivos

### Crear (2)
| Archivo | Descripción |
|---|---|
| `apps/backend/src/app/common/entities/nucleo-familiar.entity.ts` | Entidad NucleoFamiliar |
| `apps/backend/src/app/common/entities/nucleo-familiar-miembro.entity.ts` | Entidad NucleoFamiliarMiembro |

### Eliminar (1)
| Archivo | Descripción |
|---|---|
| `apps/backend/src/app/common/entities/paciente-familiar.entity.ts` | Ya no se usa |

### Modificar (11)
| Archivo | Cambio |
|---|---|
| `apps/backend/src/app/common/entities/paciente.entity.ts` | Reemplazar relación a PacienteFamiliar → NucleoFamiliarMiembro |
| `apps/backend/src/app/app.module.ts` | Agregar nuevas entidades a forRoot |
| `apps/backend/src/app/dispensacion/dispensacion.module.ts` | Agregar nuevas entidades a forFeature |
| `apps/backend/src/app/dispensacion/dto/crear-paciente.dto.ts` | Sin cambios funcionales |
| `apps/backend/src/app/dispensacion/dispensacion.service.ts` | Lógica central del núcleo |
| `apps/frontend/src/app/shared/models/familiar.model.ts` | Agregar es_titular |
| `apps/frontend/src/app/shared/models/paciente.model.ts` | Agregar es_titular |
| `apps/frontend/src/app/dispensacion/services/dispensacion.service.mock.ts` | Seed + lógica de núcleo |
| `apps/frontend/src/app/dispensacion/services/dispensacion.service.api.ts` | Mapeo API → modelo |
| `apps/frontend/src/app/dispensacion/modals/registro-paciente.modal.ts` | Posible ajuste menor |
| `apps/frontend/src/app/dispensacion/pages/paso1-escanear-paciente.page.ts` | Indicar titular |
