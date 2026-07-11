import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { PacientesService } from './pacientes.service';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';
import type { NucleoFamiliar } from '../../shared/models/nucleo-familiar.model';
import type { CensoEstadisticas } from '../../shared/models/censo-estadisticas.model';
import type { ExportarCensoResponse } from '../../shared/models/exportar-censo.model';
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
  { id: 1, id_emergencia: 'EM-2026-001', nombre: 'Juan', apellido: 'Perez', telefono: '04141234567', sexo: Sexo.M, edad_estimada: 35, fecha_nacimiento: '1991-03-15', peso_estimado: 70, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T10:00:00Z' },
  { id: 2, id_emergencia: 'EM-2026-002', nombre: 'Maria', apellido: 'Gonzalez', telefono: '04145551212', sexo: Sexo.F, edad_estimada: 28, fecha_nacimiento: '1998-07-22', peso_estimado: 55, situacion_vivienda: 'no_afectado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:30:00Z' },
  { id: 3, id_emergencia: 'EM-2026-003', nombre: 'Pedro', apellido: 'Ramirez', telefono: '04140001122', sexo: Sexo.M, edad_estimada: 60, fecha_nacimiento: '1966-01-10', peso_estimado: 80, situacion_vivienda: 'damnificado', tiene_carga_familiar: true, familiares: [], created_at: '2026-07-03T11:00:00Z' },
  { id: 4, id_emergencia: 'EM-2026-004', nombre: 'Lucía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 8, fecha_nacimiento: '2018-05-20', peso_estimado: 25, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:01Z' },
  { id: 5, id_emergencia: 'EM-2026-005', nombre: 'Sofía', apellido: 'Perez', sexo: Sexo.F, edad_estimada: 5, fecha_nacimiento: '2021-11-08', peso_estimado: 18, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T10:00:02Z' },
  { id: 6, id_emergencia: 'EM-2026-006', nombre: 'Ana', apellido: 'Ramirez', telefono: '04148889900', sexo: Sexo.F, edad_estimada: 55, fecha_nacimiento: '1971-09-03', peso_estimado: 65, situacion_vivienda: 'damnificado', tiene_carga_familiar: false, familiares: [], created_at: '2026-07-03T11:00:01Z' },
];

const SEED_PATOLOGIAS: Patologia[] = [
  { id: 1, nombre: 'Hipertensión', descripcion: 'Presión arterial elevada', activo: true },
  { id: 2, nombre: 'Diabetes', descripcion: 'Diabetes mellitus', activo: true },
  { id: 3, nombre: 'Asma', descripcion: 'Enfermedad respiratoria crónica', activo: true },
];

const SEED_NECESIDADES: Necesidad[] = [
  { id: 1, nombre: 'Medicación continua', descripcion: 'Requiere medicación de forma permanente', activo: true },
  { id: 2, nombre: 'Atención especial', descripcion: 'Requiere atención médica especializada', activo: true },
  { id: 3, nombre: 'Movilidad reducida', descripcion: 'Dificultad para movilizarse', activo: true },
];

let nextCarpaId = 1;

const CARPAS: NucleoFamiliar[] = [];

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
      if (familiar.telefono) f.telefono = familiar.telefono;
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
  buscarPaciente(searchTerm: string): Observable<Paciente[]> {
    const term = searchTerm.trim().toLowerCase();
    const results = SEED_PACIENTES.filter((pac) => {
      const fullName = `${pac.nombre} ${pac.apellido}`.toLowerCase();
      return pac.id_emergencia.toLowerCase().includes(term)
        || fullName.includes(term)
        || pac.nombre.toLowerCase().includes(term)
        || pac.apellido.toLowerCase().includes(term)
        || (pac.cedula?.toLowerCase().includes(term) ?? false)
        || (pac.telefono?.toLowerCase().includes(term) ?? false);
    });
    if (results.length === 0) return throwError(() => new Error('Paciente no encontrado'));
    return of(results.map((item) => attachFamiliares(item)));
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
      telefono: dto.telefono,
      sexo: dto.sexo,
      edad_estimada: dto.edad_estimada,
      fecha_nacimiento: dto.fecha_nacimiento,
      edad_manual: dto.edad_manual,
      es_recien_nacido: dto.es_recien_nacido,
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
          telefono: undefined,
          sexo: f.sexo,
          edad_estimada: f.edad_estimada,
          fecha_nacimiento: f.fecha_nacimiento,
          edad_manual: f.edad_manual,
          es_recien_nacido: f.es_recien_nacido,
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

  actualizarPaciente(id: number, dto: Partial<CreatePacienteDto>): Observable<Paciente> {
    const idx = SEED_PACIENTES.findIndex(p => p.id === id);
    if (idx === -1) return throwError(() => new Error('Paciente no encontrado'));
    const { familiares: _fam, ...rest } = dto;
    void _fam;
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

  marcarNecesidadSuplida(_pacienteId: number, _necesidadId: number): Observable<unknown> {
    const necesidad = SEED_NECESIDADES.find((n) => n.id === _necesidadId);
    if (!necesidad) return throwError(() => new Error('Necesidad no encontrada'));
    return of({ success: true, fecha: new Date().toISOString() });
  }

  agregarPatologia(_pacienteId: number, _dto: { patologiaId: number; tratamiento?: string }): Observable<unknown> {
    return of({ success: true });
  }

  quitarPatologia(_pacienteId: number, _patologiaId: number): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  agregarNecesidad(_pacienteId: number, _necesidadId: number): Observable<unknown> {
    return of({ success: true });
  }

  quitarNecesidad(_pacienteId: number, _necesidadId: number): Observable<{ success: boolean }> {
    return of({ success: true });
  }

  getPatologias(): Observable<Patologia[]> {
    return of(SEED_PATOLOGIAS);
  }

  getNecesidades(): Observable<Necesidad[]> {
    return of(SEED_NECESIDADES);
  }

  private calcularEdad(p: Paciente): number {
    if (p.fecha_nacimiento) {
      const nac = new Date(p.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nac.getFullYear();
      const mes = hoy.getMonth() - nac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
      return Math.max(0, edad);
    }
    if (p.edad_manual != null) return p.edad_manual;
    return p.edad_estimada;
  }

  getEstadisticasCenso(): Observable<CensoEstadisticas> {
    const hoy = new Date();
    const esRecienNacido = (p: Paciente): boolean => {
      if (p.es_recien_nacido) return true;
      if (p.fecha_nacimiento) {
        const dias = Math.floor((hoy.getTime() - new Date(p.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24));
        return dias <= 28;
      }
      return this.calcularEdad(p) === 0;
    };

    const estadisticas: CensoEstadisticas = {
      totalPacientes: SEED_PACIENTES.length,
      masculinos: SEED_PACIENTES.filter(p => p.sexo === Sexo.M).length,
      femeninos: SEED_PACIENTES.filter(p => p.sexo === Sexo.F).length,
      recienNacidos: SEED_PACIENTES.filter(p => esRecienNacido(p)).length,
      preescolares: SEED_PACIENTES.filter(p => !esRecienNacido(p) && this.calcularEdad(p) >= 1 && this.calcularEdad(p) <= 5).length,
      escolares: SEED_PACIENTES.filter(p => this.calcularEdad(p) > 5 && this.calcularEdad(p) <= 12).length,
      adolescentes: SEED_PACIENTES.filter(p => this.calcularEdad(p) > 12 && this.calcularEdad(p) <= 18).length,
      adultos: SEED_PACIENTES.filter(p => this.calcularEdad(p) > 18 && this.calcularEdad(p) <= 59).length,
      adultosMayores: SEED_PACIENTES.filter(p => this.calcularEdad(p) >= 60).length,
      conDiscapacidadMotora: SEED_PACIENTES.filter(p => p.tiene_discapacidad_motora).length,
      totalNoAfectados: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'no_afectado').length,
      totalViviendaAfectada: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'vivienda_afectada').length,
      totalDamnificados: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'damnificado').length,
      totalCarpas: CARPAS.length,
      porPatologia: [],
      porNecesidad: [],
      porUbicacion: [],
    };
    return of(estadisticas);
  }

  exportarCensoCompleto(): Observable<ExportarCensoResponse> {
    const pacientesConCarpa = SEED_PACIENTES.map(p => {
      const nucleo = findNucleo(p.id);
      return {
        carpa: nucleo ? `CARPA-${String(nucleo.id).padStart(4, '0')}` : 'SIN CARPA',
        ubicacion: null,
        idEmergencia: p.id_emergencia,
        nombre: p.nombre,
        apellido: p.apellido,
        cedula: p.cedula ?? null,
        telefono: p.telefono ?? null,
        sexo: p.sexo,
        edadEstimada: p.edad_estimada,
        pesoEstimado: p.peso_estimado,
        situacionVivienda: p.situacion_vivienda,
        tieneDiscapacidadMotora: p.tiene_discapacidad_motora ?? false,
        relacion: nucleo?.miembros.find(m => m.pacienteId === p.id)?.relacion ?? 'Titular',
        patologias: [],
        necesidades: [],
      };
    });

    return of({
      metrica: {
        totalPacientes: SEED_PACIENTES.length,
        masculinos: SEED_PACIENTES.filter(p => p.sexo === Sexo.M).length,
        femeninos: SEED_PACIENTES.filter(p => p.sexo === Sexo.F).length,
        recienNacidos: 0,
        preescolares: 0,
        escolares: 0,
        adolescentes: 0,
        adultos: SEED_PACIENTES.length,
        adultosMayores: 0,
        conDiscapacidadMotora: 0,
        totalNoAfectados: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'no_afectado').length,
        totalViviendaAfectada: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'vivienda_afectada').length,
        totalDamnificados: SEED_PACIENTES.filter(p => p.situacion_vivienda === 'damnificado').length,
        totalCarpas: CARPAS.length,
        porPatologia: [],
        porNecesidad: [],
        porUbicacion: [],
      },
      pacientes: pacientesConCarpa,
      metricaMedicamentos: {
        totalMedicamentos: 0,
        totalDispensaciones: 0,
        totalDosis: 0,
        promedioDosisPorDia: 0,
        medicamentosMasDispensados: [],
        medicamentosSinMovimientos: [],
      },
      dispensaciones: [],
    });
  }

  crearCarpa(dto: { ubicacion?: string }): Observable<NucleoFamiliar> {
    const codigo = `CARPA-${String(nextCarpaId++).padStart(4, '0')}`;
    const nueva: NucleoFamiliar = {
      id: nextCarpaId,
      codigoCarpa: codigo,
      ubicacion: dto.ubicacion,
      activo: true,
      createdAt: new Date().toISOString(),
    };
    CARPAS.push(nueva);
    return of(nueva);
  }

  listarCarpas(): Observable<NucleoFamiliar[]> {
    return of([...CARPAS]);
  }

  getCarpaByCodigo(codigo: string): Observable<NucleoFamiliar> {
    const carpa = CARPAS.find(c => c.codigoCarpa === codigo);
    if (!carpa) return throwError(() => new Error(`Carpa con código ${codigo} no encontrada`));
    return of(carpa);
  }

  agregarMiembroCarpa(codigoCarpa: string, pacienteId: number, relacion?: string): Observable<unknown> {
    const carpa = CARPAS.find(c => c.codigoCarpa === codigoCarpa);
    if (!carpa) return throwError(() => new Error(`Carpa con código ${codigoCarpa} no encontrada`));
    const paciente = SEED_PACIENTES.find(p => p.id === pacienteId);
    if (!paciente) return throwError(() => new Error(`Paciente ${pacienteId} no encontrado`));
    return of({ success: true, relacion: relacion ?? 'Miembro' });
  }

  actualizarCarpa(codigoCarpa: string, dto: { ubicacion?: string }): Observable<NucleoFamiliar> {
    const carpa = CARPAS.find(c => c.codigoCarpa === codigoCarpa);
    if (!carpa) return throwError(() => new Error(`Carpa con código ${codigoCarpa} no encontrada`));
    if (dto.ubicacion !== undefined) carpa.ubicacion = dto.ubicacion;
    return of({ ...carpa });
  }

  eliminarCarpa(codigoCarpa: string): Observable<{ success: boolean }> {
    const idx = CARPAS.findIndex(c => c.codigoCarpa === codigoCarpa);
    if (idx === -1) return throwError(() => new Error(`Carpa con código ${codigoCarpa} no encontrada`));
    CARPAS.splice(idx, 1);
    return of({ success: true });
  }

  listarCarpasConMiembros(): Observable<NucleoFamiliar[]> {
    return this.listarCarpas();
  }
}
