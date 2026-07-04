import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { PacientesService } from './pacientes.service';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import { Sexo } from '../../shared/enums/sexo.enum';

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
  { id: 1, id_emergencia: 'EM-2026-001', nombre: 'Juan', apellido: 'Perez', sexo: Sexo.M, edad_estimada: 35, peso_estimado: 70, es_damnificado: true, tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T10:00:00Z' },
  { id: 2, id_emergencia: 'EM-2026-002', nombre: 'Maria', apellido: 'Gonzalez', sexo: Sexo.F, edad_estimada: 28, peso_estimado: 55, es_damnificado: false, tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:30:00Z' },
  { id: 3, id_emergencia: 'EM-2026-003', nombre: 'Pedro', apellido: 'Ramirez', sexo: Sexo.M, edad_estimada: 60, peso_estimado: 80, es_damnificado: true, tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T11:00:00Z' },
  { id: 4, id_emergencia: 'EM-2026-004', nombre: 'Lucía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 8, peso_estimado: 25, es_damnificado: true, tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:01Z' },
  { id: 5, id_emergencia: 'EM-2026-005', nombre: 'Sofía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 5, peso_estimado: 18, es_damnificado: true, tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:02Z' },
  { id: 6, id_emergencia: 'EM-2026-006', nombre: 'Ana', apellido: 'Ramirez', sexo: Sexo.F, edad_estimada: 55, peso_estimado: 65, es_damnificado: true, tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T11:00:01Z' },
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
        es_damnificado: familiar.es_damnificado,
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
export class MockPacientesService extends PacientesService {
  buscarPaciente(searchTerm: string): Observable<Paciente> {
    const term = searchTerm.trim().toLowerCase();
    const results = SEED_PACIENTES.filter((pac) => {
      const fullName = `${pac.nombre} ${pac.apellido}`.toLowerCase();
      return pac.id_emergencia.toLowerCase().includes(term)
        || fullName.includes(term)
        || pac.nombre.toLowerCase().includes(term)
        || pac.apellido.toLowerCase().includes(term)
        || (pac.cedula?.toLowerCase().includes(term) ?? false);
    });
    if (results.length === 0) return throwError(() => new Error('Paciente no encontrado'));
    return of(attachFamiliares(results[0]));
  }

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
      es_damnificado: dto.es_damnificado,
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
          es_damnificado: f.es_damnificado,
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

  actualizarPaciente(id: number, dto: Partial<CreatePacienteDto>): Observable<Paciente> {
    const idx = SEED_PACIENTES.findIndex(p => p.id === id);
    if (idx === -1) return throwError(() => new Error('Paciente no encontrado'));
    const { familiares, ...rest } = dto;
    SEED_PACIENTES[idx] = { ...SEED_PACIENTES[idx], ...rest };
    return of(attachFamiliares(SEED_PACIENTES[idx]));
  }

  eliminarPaciente(id: number): Observable<{ success: boolean }> {
    const idx = SEED_PACIENTES.findIndex(p => p.id === id);
    if (idx === -1) return throwError(() => new Error('Paciente no encontrado'));
    SEED_PACIENTES.splice(idx, 1);
    return of({ success: true });
  }

  getPacienteById(id: number): Observable<Paciente> {
    const p = SEED_PACIENTES.find(pac => pac.id === id);
    if (!p) return throwError(() => new Error('Paciente no encontrado'));
    return of(attachFamiliares(p));
  }

  getPacienteByIdEmergencia(idEmergencia: string): Observable<Paciente> {
    const p = SEED_PACIENTES.find(pac => pac.id_emergencia === idEmergencia);
    if (!p) return throwError(() => new Error('Paciente no encontrado'));
    return of(attachFamiliares(p));
  }

  getNucleo(pacienteId: number): Observable<Familiar[]> {
    const familiares = buildFamiliares(pacienteId);
    return of(familiares);
  }

  agregarFamiliar(pacienteId: number, targetPacienteId: number, relacion: string): Observable<unknown> {
    const nucleo = findNucleo(pacienteId);
    if (!nucleo) return throwError(() => new Error('El paciente no pertenece a un núcleo familiar'));
    nucleo.miembros.push({ pacienteId: targetPacienteId, relacion });
    return of({ success: true });
  }

  quitarFamiliar(pacienteId: number, miembroId: number): Observable<{ success: boolean }> {
    const nucleo = findNucleo(pacienteId);
    if (!nucleo) return throwError(() => new Error('El paciente no pertenece a un núcleo familiar'));
    const idx = nucleo.miembros.findIndex(m => m.pacienteId === miembroId);
    if (idx === -1) return throwError(() => new Error('Familiar no encontrado'));
    nucleo.miembros.splice(idx, 1);
    return of({ success: true });
  }
}
