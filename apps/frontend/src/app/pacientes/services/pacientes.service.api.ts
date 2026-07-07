import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { PacientesService } from './pacientes.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { CreatePacienteDto, Paciente } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';
import type { NucleoFamiliar } from '../../shared/models/nucleo-familiar.model';
import type { CensoEstadisticas } from '../../shared/models/censo-estadisticas.model';

interface ApiPaciente {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  sexo: Sexo;
  edadEstimada: number;
  fechaNacimiento?: string;
  edadManual?: number;
  esRecienNacido?: boolean;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  tieneDiscapacidadMotora?: boolean;
  esTitular?: boolean;
  codigoCarpa?: string;
  familiares?: ApiNucleoMiembro[];
  pacientePatologias?: Array<{ id: number; patologiaId: number; tratamiento?: string; patologia: { id: number; nombre: string } }>;
  pacienteNecesidades?: Array<{ id: number; necesidadId: number; necesidad: { id: number; nombre: string } }>;
  activo: boolean;
  createdAt: string;
}

interface ApiNucleoMiembro {
  id: number;
  nucleoId: number;
  pacienteId: number;
  relacion: string;
  paciente?: ApiPacienteSimple;
  nucleo?: {
    id: number;
    codigoCarpa?: string;
    activo: boolean;
    createdAt: string;
    miembros: Array<{
      id: number;
      nucleoId: number;
      pacienteId: number;
      relacion: string;
      activo: boolean;
      paciente: ApiPacienteSimple;
    }>;
    titular: ApiPacienteSimple;
  };
}

interface ApiPacienteSimple {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  sexo: Sexo;
  edadEstimada: number;
  fechaNacimiento?: string;
  edadManual?: number;
  esRecienNacido?: boolean;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  createdAt: string;
}

@Injectable()
export class ApiPacientesService extends PacientesService {
  private readonly http = inject(HttpClient);

  buscarPaciente(searchTerm: string, incluirInactivos?: boolean): Observable<Paciente[]> {
    const base = `${API_BASE_URL}/pacientes?q=${encodeURIComponent(searchTerm)}`;
    const url = incluirInactivos ? `${base}&incluirInactivos=true` : base;
    return this.http
      .get<ApiPaciente[]>(url)
      .pipe(map((items) => items.map((item) => this.toPaciente(item))));
  }

  registrarPaciente(dto: CreatePacienteDto): Observable<Paciente> {
    const body: Record<string, unknown> = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      sexo: dto.sexo,
      edadEstimada: dto.edad_estimada,
      pesoEstimado: dto.peso_estimado,
      esDamnificado: dto.es_damnificado,
      tieneCargaFamiliar: dto.tiene_carga_familiar ?? false,
    };
    if (dto.id_emergencia) body['idEmergencia'] = dto.id_emergencia;
    if (dto.cedula) body['cedula'] = dto.cedula;
    if (dto.telefono) body['telefono'] = dto.telefono;
    if (dto.fecha_nacimiento) body['fechaNacimiento'] = dto.fecha_nacimiento;
    if (dto.edad_manual !== undefined) body['edadManual'] = dto.edad_manual;
    if (dto.es_recien_nacido !== undefined) body['esRecienNacido'] = dto.es_recien_nacido;
    if (dto.tiene_discapacidad_motora !== undefined) body['tieneDiscapacidadMotora'] = dto.tiene_discapacidad_motora;
    if (dto.patologiaIds?.length) body['patologiaIds'] = dto.patologiaIds;
    else if (dto.patologias?.length) body['patologias'] = dto.patologias;
    if (dto.necesidadIds?.length) body['necesidadIds'] = dto.necesidadIds;
    if (dto.familiares?.length) {
      body['familiares'] = dto.familiares.map((f) => ({
        nombre: f.nombre,
        apellido: f.apellido,
        cedula: f.cedula,
        sexo: f.sexo,
        edadEstimada: f.edad_estimada,
        fechaNacimiento: f.fecha_nacimiento,
        edadManual: f.edad_manual,
        esRecienNacido: f.es_recien_nacido,
        pesoEstimado: f.peso_estimado,
        esDamnificado: f.es_damnificado,
        relacion: f.relacion,
      }));
    }
    return this.http
      .post<ApiPaciente>(`${API_BASE_URL}/pacientes`, body)
      .pipe(map((item) => this.toPaciente(item)));
  }

  actualizarPaciente(id: number, dto: Partial<CreatePacienteDto>): Observable<Paciente> {
    const body: Record<string, unknown> = {};
    if (dto.nombre !== undefined) body['nombre'] = dto.nombre;
    if (dto.apellido !== undefined) body['apellido'] = dto.apellido;
    if (dto.cedula !== undefined) body['cedula'] = dto.cedula;
    if (dto.telefono !== undefined) body['telefono'] = dto.telefono;
    if (dto.sexo !== undefined) body['sexo'] = dto.sexo;
    if (dto.edad_estimada !== undefined) body['edadEstimada'] = dto.edad_estimada;
    if (dto.peso_estimado !== undefined) body['pesoEstimado'] = dto.peso_estimado;
    if (dto.es_damnificado !== undefined) body['esDamnificado'] = dto.es_damnificado;
    if (dto.fecha_nacimiento !== undefined) body['fechaNacimiento'] = dto.fecha_nacimiento;
    if (dto.edad_manual !== undefined) body['edadManual'] = dto.edad_manual;
    if (dto.es_recien_nacido !== undefined) body['esRecienNacido'] = dto.es_recien_nacido;
    if (dto.tiene_discapacidad_motora !== undefined) body['tieneDiscapacidadMotora'] = dto.tiene_discapacidad_motora;
    if (dto.patologiaIds?.length) body['patologiaIds'] = dto.patologiaIds;
    else if (dto.patologias?.length) body['patologias'] = dto.patologias;
    if (dto.necesidadIds?.length) body['necesidadIds'] = dto.necesidadIds;
    return this.http
      .patch<ApiPaciente>(`${API_BASE_URL}/pacientes/${id}`, body)
      .pipe(map((item) => this.toPaciente(item)));
  }

  eliminarPaciente(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_BASE_URL}/pacientes/${id}`);
  }

  getPacienteById(id: number): Observable<Paciente> {
    return this.http
      .get<ApiPaciente>(`${API_BASE_URL}/pacientes/${id}`)
      .pipe(map((item) => this.toPaciente(item)));
  }

  getPacienteByIdEmergencia(idEmergencia: string): Observable<Paciente> {
    return this.http
      .get<ApiPaciente>(`${API_BASE_URL}/pacientes/emergencia/${encodeURIComponent(idEmergencia)}`)
      .pipe(map((item) => this.toPaciente(item)));
  }

  getNucleo(pacienteId: number): Observable<Familiar[]> {
    return this.http
      .get<Record<string, unknown>[]>(`${API_BASE_URL}/pacientes/${pacienteId}/nucleo`)
      .pipe(
        map((items) =>
          items.map((item) => ({
            id: item['id'] as number,
            id_emergencia: (item['idEmergencia'] as string) ?? '',
            nombre: (item['nombre'] as string) ?? '',
            apellido: (item['apellido'] as string) ?? '',
            cedula: (item['cedula'] as string | undefined) ?? undefined,
            sexo: item['sexo'] as Sexo,
            edad_estimada: (item['edadEstimada'] as number) ?? 0,
            peso_estimado: (item['pesoEstimado'] as number) ?? 0,
            es_damnificado: (item['esDamnificado'] as boolean) ?? false,
            tiene_carga_familiar: (item['tieneCargaFamiliar'] as boolean) ?? false,
            relacion: (item['relacion'] as string) ?? '',
            created_at: (item['createdAt'] as string) ?? '',
          })),
        ),
      );
  }

  agregarFamiliar(pacienteId: number, targetPacienteId: number, relacion: string): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/pacientes/${pacienteId}/nucleo`, {
      pacienteId: targetPacienteId,
      relacion,
    });
  }

  quitarFamiliar(pacienteId: number, miembroId: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_BASE_URL}/pacientes/${pacienteId}/nucleo/${miembroId}`);
  }

  getPatologias(): Observable<Patologia[]> {
    return this.http.get<Patologia[]>(`${API_BASE_URL}/patologias`);
  }

  getNecesidades(): Observable<Necesidad[]> {
    return this.http.get<Necesidad[]>(`${API_BASE_URL}/necesidades`);
  }

  getEstadisticasCenso(): Observable<CensoEstadisticas> {
    return this.http.get<CensoEstadisticas>(`${API_BASE_URL}/censo/estadisticas`);
  }

  crearCarpa(dto: { ubicacion?: string }): Observable<NucleoFamiliar> {
    return this.http.post<NucleoFamiliar>(`${API_BASE_URL}/censo/carpas`, dto);
  }

  listarCarpas(): Observable<NucleoFamiliar[]> {
    return this.http.get<NucleoFamiliar[]>(`${API_BASE_URL}/censo/carpas`);
  }

  getCarpaByCodigo(codigo: string): Observable<NucleoFamiliar> {
    return this.http.get<NucleoFamiliar>(`${API_BASE_URL}/censo/carpas/${encodeURIComponent(codigo)}`);
  }

  agregarMiembroCarpa(codigoCarpa: string, pacienteId: number, relacion?: string): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/censo/carpas/${encodeURIComponent(codigoCarpa)}/miembros`, {
      pacienteId,
      relacion: relacion ?? 'Miembro',
    });
  }

  actualizarCarpa(codigoCarpa: string, dto: { ubicacion?: string }): Observable<NucleoFamiliar> {
    return this.http.patch<NucleoFamiliar>(`${API_BASE_URL}/censo/carpas/${encodeURIComponent(codigoCarpa)}`, dto);
  }

  eliminarCarpa(codigoCarpa: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_BASE_URL}/censo/carpas/${encodeURIComponent(codigoCarpa)}`);
  }

  listarCarpasConMiembros(): Observable<NucleoFamiliar[]> {
    return this.http.get<NucleoFamiliar[]>(`${API_BASE_URL}/censo/carpas?includeMiembros=true`);
  }

  private toFamiliar(pf: ApiNucleoMiembro): Familiar {
    const p = pf.paciente ?? pf.nucleo?.miembros?.find((m) => m.pacienteId === pf.pacienteId)?.paciente;
    if (!p) {
      console.warn('toFamiliar: no paciente data for member', pf);
      return {
        id: 0,
        id_emergencia: '',
        nombre: '',
        apellido: '',
        sexo: 'M' as Sexo,
        edad_estimada: 0,
        peso_estimado: 0,
        es_damnificado: false,
        tiene_carga_familiar: false,
        relacion: pf.relacion,
        created_at: '',
      };
    }
    return {
      id: p.id,
      id_emergencia: p.idEmergencia,
      nombre: p.nombre,
      apellido: p.apellido,
      cedula: p.cedula ?? undefined,
      telefono: p.telefono ?? undefined,
      sexo: p.sexo,
      edad_estimada: p.edadEstimada,
      peso_estimado: p.pesoEstimado,
      es_damnificado: p.esDamnificado,
      tiene_carga_familiar: p.tieneCargaFamiliar,
      relacion: pf.relacion,
      created_at: p.createdAt,
    };
  }

  private toPaciente(item: ApiPaciente): Paciente {
    return {
      id: item.id,
      id_emergencia: item.idEmergencia,
      nombre: item.nombre,
      apellido: item.apellido,
      cedula: item.cedula ?? undefined,
      telefono: item.telefono ?? undefined,
      sexo: item.sexo,
      edad_estimada: item.edadEstimada,
      fecha_nacimiento: item.fechaNacimiento,
      edad_manual: item.edadManual,
      es_recien_nacido: item.esRecienNacido,
      peso_estimado: item.pesoEstimado,
      es_damnificado: item.esDamnificado,
      tiene_carga_familiar: item.tieneCargaFamiliar,
      tiene_discapacidad_motora: item.tieneDiscapacidadMotora,
      es_titular: item.esTitular,
      codigo_carpa: item.codigoCarpa,
      pacientePatologias: item.pacientePatologias,
      pacienteNecesidades: item.pacienteNecesidades,
      familiares: item.familiares?.map((pf) => this.toFamiliar(pf)),
      activo: item.activo,
      created_at: item.createdAt,
    };
  }
}
