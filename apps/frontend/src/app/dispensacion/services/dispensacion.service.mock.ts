import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { DispensacionService } from './dispensacion.service';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

import type { Configuracion } from '../../shared/models/configuracion.model';
import type { Dispensacion, CreateDispensacionDto } from '../../shared/models/dispensacion.model';
import type { Receta } from '../../shared/models/receta.model';
import { Sexo } from '../../shared/enums/sexo.enum';
import { Rol } from '../../shared/enums/rol.enum';

interface NucleoSeed {
  id: number;
  titularId: number;
  miembros: { pacienteId: number; relacion: string }[];
}

let nextPacienteId = 7;
let nextNucleoId = 3;

const SEED_NUCLEOS: NucleoSeed[] = [
  {
    id: 1,
    titularId: 1,
    miembros: [
      { pacienteId: 1, relacion: 'Titular' },
      { pacienteId: 4, relacion: 'Hijo/a' },
      { pacienteId: 5, relacion: 'Hijo/a' },
    ],
  },
  {
    id: 2,
    titularId: 3,
    miembros: [
      { pacienteId: 3, relacion: 'Titular' },
      { pacienteId: 6, relacion: 'Cónyuge' },
    ],
  },
];

const SEED_PACIENTES: Paciente[] = [
  { id: 1, id_emergencia: 'EM-2026-001', nombre: 'Juan', apellido: 'Perez', sexo: Sexo.M, edad_estimada: 35, peso_estimado: 70, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T10:00:00Z' },
  { id: 2, id_emergencia: 'EM-2026-002', nombre: 'Maria', apellido: 'Gonzalez', sexo: Sexo.F, edad_estimada: 28, peso_estimado: 55, situacion_vivienda: 'no_afectado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:30:00Z' },
  { id: 3, id_emergencia: 'EM-2026-003', nombre: 'Pedro', apellido: 'Ramirez', sexo: Sexo.M, edad_estimada: 60, peso_estimado: 80, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T11:00:00Z' },
  { id: 4, id_emergencia: 'EM-2026-004', nombre: 'Lucía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 8, peso_estimado: 25, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:01Z' },
  { id: 5, id_emergencia: 'EM-2026-005', nombre: 'Sofía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 5, peso_estimado: 18, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:02Z' },
  { id: 6, id_emergencia: 'EM-2026-006', nombre: 'Ana', apellido: 'Ramirez', sexo: Sexo.F, edad_estimada: 55, peso_estimado: 65, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T11:00:01Z' },
];

const SEED_MEDICAMENTOS: Medicamento[] = [
  { id: 1, nombre_generico: 'Amoxicilina', presentacion: 'Suspensión', concentracion: 250, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 2, nombre_generico: 'Paracetamol', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 3, nombre_generico: 'Ibuprofeno', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 4, nombre_generico: 'Loratadina', presentacion: 'Tableta', concentracion: 10, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 5, nombre_generico: 'Salbutamol', presentacion: 'Inhalador', concentracion: 100, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 6, nombre_generico: 'Omeprazol', presentacion: 'Cápsula', concentracion: 20, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 7, nombre_generico: 'Dexametasona', presentacion: 'Inyectable', concentracion: 8, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 8, nombre_generico: 'Diclofenaco', presentacion: 'Tableta', concentracion: 50, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 9, nombre_generico: 'Suero Oral', presentacion: 'Sobre', concentracion: 1, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 10, nombre_generico: 'Metronidazol', presentacion: 'Tableta', concentracion: 250, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
];

const SEED_CONFIGS: Configuracion[] = [
  { id: 1, medicamento_id: 1, umbral_minimo: 100, dosis_maxima_mg_kg: 15, peso_referencia_kg: 70, updated_at: '' },
  { id: 2, medicamento_id: 2, umbral_minimo: 200, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '' },
  { id: 3, medicamento_id: 3, umbral_minimo: 50, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '' },
];

let nextDispensacionId = 1;
const dispensaciones: Dispensacion[] = [];

const SEED_RECETAS: Receta[] = [
  {
    id: 1,
    paciente_id: 1,
    paciente: { ...SEED_PACIENTES[0], familiares: [] },
    doctor_id: 1,
    doctor: { id: 1, nombre: 'Dr. Garcia', rol: Rol.DOCTOR },
    fecha_hora: new Date(Date.now() - 3600000).toISOString(),
    estado: 'pendiente',
    activo: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    detalles: [
      { id: 1, receta_id: 1, medicamento_id: 1, medicamento: SEED_MEDICAMENTOS[0], cantidad_recetada: 30, dias: 10, created_at: '' },
      { id: 2, receta_id: 1, medicamento_id: 2, medicamento: SEED_MEDICAMENTOS[1], cantidad_recetada: 15, dias: 5, created_at: '' },
    ],
  },
  {
    id: 2,
    paciente_id: 3,
    paciente: { ...SEED_PACIENTES[2], familiares: [] },
    doctor_id: 1,
    doctor: { id: 1, nombre: 'Dr. Garcia', rol: Rol.DOCTOR },
    fecha_hora: new Date(Date.now() - 7200000).toISOString(),
    estado: 'pendiente',
    activo: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    detalles: [
      { id: 3, receta_id: 2, medicamento_id: 3, medicamento: SEED_MEDICAMENTOS[2], cantidad_recetada: 20, dias: 7, created_at: '' },
    ],
  },
];

function findNucleo(pacienteId: number): NucleoSeed | undefined {
  return SEED_NUCLEOS.find((n) =>
    n.miembros.some((m) => m.pacienteId === pacienteId),
  );
}

function buildFamiliares(pacienteId: number, nucleo?: NucleoSeed): Familiar[] {
  const n = nucleo ?? findNucleo(pacienteId);
  if (!n) return [];
  return n.miembros
    .filter((m) => m.pacienteId !== pacienteId)
    .map((m) => {
      const familiar = SEED_PACIENTES.find((p) => p.id === m.pacienteId);
      if (!familiar) return null;
      const f: Familiar = {
        id: familiar.id,
        id_emergencia: familiar.id_emergencia,
        nombre: familiar.nombre,
        apellido: familiar.apellido,
        sexo: familiar.sexo,
        edad_estimada: familiar.edad_estimada,
        peso_estimado: familiar.peso_estimado,
        situacion_vivienda: familiar.situacion_vivienda,
        tiene_carga_familiar: familiar.tiene_carga_familiar,
        relacion: m.relacion,
        created_at: familiar.created_at,
      };
      if (familiar.cedula) f.cedula = familiar.cedula;
      return f;
    })
    .filter((f): f is Familiar => f !== null);
}

function attachFamiliares(paciente: Paciente): Paciente {
  const nucleo = findNucleo(paciente.id);
  const familiares = buildFamiliares(paciente.id, nucleo);
  const esTitular = nucleo?.titularId === paciente.id;
  return { ...paciente, familiares, es_titular: esTitular };
}

@Injectable()
export class MockDispensacionService extends DispensacionService {
  registrarPaciente(dto: CreatePacienteDto): Observable<Paciente> {
    if (dto.id_emergencia) {
      const exists = SEED_PACIENTES.find(p => p.id_emergencia === dto.id_emergencia);
      if (exists) return throwError(() => new Error('Ya existe un paciente con ese ID de emergencia'));
    }
    const year = new Date().getFullYear();
    const existing = SEED_PACIENTES.filter(p => p.id_emergencia.startsWith(`EM-${year}-`));
    let nextSeq = 1;
    if (existing.length > 0) {
      const seqs = existing.map(p => parseInt(p.id_emergencia.split('-')[2], 10)).filter(n => !isNaN(n));
      if (seqs.length > 0) nextSeq = Math.max(...seqs) + 1;
    }
    const idEmergencia = dto.id_emergencia || `EM-${year}-${String(nextSeq).padStart(3, '0')}`;

    const nuevo: Paciente = {
      id: nextPacienteId++,
      id_emergencia: idEmergencia,
      nombre: dto.nombre,
      apellido: dto.apellido,
      cedula: dto.cedula,
      sexo: dto.sexo,
      edad_estimada: dto.edad_estimada,
      peso_estimado: dto.peso_estimado,
      situacion_vivienda: dto.situacion_vivienda,
      tiene_carga_familiar: dto.tiene_carga_familiar ?? false,
      familiares: [],
      created_at: new Date().toISOString(),
    };
    SEED_PACIENTES.push(nuevo);

    if (dto.familiares?.length) {
      const nucleo: NucleoSeed = {
        id: nextNucleoId++,
        titularId: nuevo.id,
        miembros: [{ pacienteId: nuevo.id, relacion: 'Titular' }],
      };
      SEED_NUCLEOS.push(nucleo);

      for (const f of dto.familiares) {
        const familiarId = nextPacienteId++;
        const familiarPaciente: Paciente = {
          id: familiarId,
          id_emergencia: `EM-${year}-${String(nextSeq + 1).padStart(3, '0')}`,
          nombre: f.nombre,
          apellido: f.apellido ?? '',
          cedula: f.cedula,
          sexo: f.sexo,
          edad_estimada: f.edad_estimada,
          peso_estimado: f.peso_estimado,
          situacion_vivienda: f.situacion_vivienda,
          tiene_carga_familiar: false,
          familiares: [],
          created_at: new Date().toISOString(),
        };
        SEED_PACIENTES.push(familiarPaciente);

        nucleo.miembros.push({
          pacienteId: familiarPaciente.id,
          relacion: f.relacion,
        });
      }

      nuevo.tiene_carga_familiar = true;
    }

    return of(attachFamiliares(nuevo));
  }

  buscarPaciente(searchTerm: string): Observable<Paciente[]> {
    const term = searchTerm.trim().toLowerCase();
    const results = SEED_PACIENTES.filter((pac) => {
      const fullName = `${pac.nombre} ${pac.apellido}`.toLowerCase();
      return pac.id_emergencia.toLowerCase().includes(term)
        || fullName.includes(term)
        || pac.nombre.toLowerCase().includes(term)
        || pac.apellido.toLowerCase().includes(term)
        || (pac.cedula?.toLowerCase().includes(term) ?? false);
    });
    return of(results.map((p) => attachFamiliares(p)));
  }

  buscarMedicamentos(search: string): Observable<Medicamento[]> {
    const s = search.toLowerCase();
    const results = SEED_MEDICAMENTOS.filter(m =>
      m.nombre_generico.toLowerCase().includes(s) ||
      (m.nombre_comercial?.toLowerCase().includes(s))
    );
    return of(results);
  }

  getLimiteDosis(medicamentoId: number): Observable<Configuracion | null> {
    const config = SEED_CONFIGS.find(c => c.medicamento_id === medicamentoId) ?? null;
    return of(config);
  }

  getRecetasPendientes(): Observable<Receta[]> {
    return of(SEED_RECETAS.filter(r => r.estado === 'pendiente' && r.activo));
  }

  crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion> {
    const paciente = SEED_PACIENTES.find(p => p.id === dto.paciente_id);
    if (!paciente) return throwError(() => new Error('Paciente no encontrado'));

    const items = dto.items.map((item, i) => {
      const medicamento = SEED_MEDICAMENTOS.find(m => m.id === item.medicamento_id);
      const dosisMgKg = paciente.peso_estimado > 0
        ? (item.cantidad * (medicamento?.concentracion ?? 0)) / paciente.peso_estimado
        : undefined;

      return {
        id: i + 1,
        dispensacion_id: nextDispensacionId,
        medicamento_id: item.medicamento_id,
        medicamento_nombre: medicamento?.nombre_generico,
        cantidad: item.cantidad,
        dosis_mg_kg: dosisMgKg,
        created_at: new Date().toISOString(),
      };
    });

    const dispensacion: Dispensacion = {
      id: nextDispensacionId++,
      paciente_id: dto.paciente_id,
      usuario_id: 1,
      fecha_hora: new Date().toISOString(),
      observaciones: dto.observaciones,
      items,
      paciente,
    };
    dispensaciones.push(dispensacion);
    return of(dispensacion);
  }
}
