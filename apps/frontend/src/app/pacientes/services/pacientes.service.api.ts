import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { PacientesService } from './pacientes.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { CreatePacienteDto, Paciente } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';

interface ApiPaciente {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  esTitular?: boolean;
  familiares?: ApiNucleoMiembro[];
  createdAt: string;
}

interface ApiNucleoMiembro {
  id: number;
  nucleoId: number;
  pacienteId: number;
  relacion: string;
  paciente: ApiPacienteSimple;
}

interface ApiPacienteSimple {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  createdAt: string;
}

@Injectable()
export class ApiPacientesService extends PacientesService {
  constructor(private readonly http: HttpClient) {
    super();
  }

  buscarPaciente(searchTerm: string): Observable<Paciente> {
    return this.http
      .get<ApiPaciente[]>(`${API_BASE_URL}/pacientes?q=${encodeURIComponent(searchTerm)}`)
      .pipe(
        map((items) => {
          if (!items.length) throw new Error('Paciente no encontrado');
          return this.toPaciente(items[0]);
        }),
      );
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
    if (dto.familiares?.length) {
      body['familiares'] = dto.familiares.map((f) => ({
        nombre: f.nombre,
        apellido: f.apellido,
        cedula: f.cedula,
        sexo: f.sexo,
        edadEstimada: f.edad_estimada,
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
    if (dto.sexo !== undefined) body['sexo'] = dto.sexo;
    if (dto.edad_estimada !== undefined) body['edadEstimada'] = dto.edad_estimada;
    if (dto.peso_estimado !== undefined) body['pesoEstimado'] = dto.peso_estimado;
    if (dto.es_damnificado !== undefined) body['esDamnificado'] = dto.es_damnificado;
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

  private toFamiliar(pf: ApiNucleoMiembro): Familiar {
    return {
      id: pf.paciente.id,
      id_emergencia: pf.paciente.idEmergencia!,
      nombre: pf.paciente.nombre!,
      apellido: pf.paciente.apellido!,
      cedula: pf.paciente.cedula ?? undefined,
      sexo: pf.paciente.sexo!,
      edad_estimada: pf.paciente.edadEstimada!,
      peso_estimado: pf.paciente.pesoEstimado!,
      es_damnificado: pf.paciente.esDamnificado!,
      tiene_carga_familiar: pf.paciente.tieneCargaFamiliar!,
      relacion: pf.relacion,
      created_at: pf.paciente.createdAt!,
    };
  }

  private toPaciente(item: ApiPaciente): Paciente {
    return {
      id: item.id,
      id_emergencia: item.idEmergencia,
      nombre: item.nombre,
      apellido: item.apellido,
      cedula: item.cedula ?? undefined,
      sexo: item.sexo,
      edad_estimada: item.edadEstimada,
      peso_estimado: item.pesoEstimado,
      es_damnificado: item.esDamnificado,
      tiene_carga_familiar: item.tieneCargaFamiliar,
      es_titular: item.esTitular,
      familiares: item.familiares?.map((pf) => this.toFamiliar(pf)),
      created_at: item.createdAt,
    };
  }
}
