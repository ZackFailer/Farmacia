import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import type { Patologia } from '../../shared/models/patologia.model';
import type { Necesidad } from '../../shared/models/necesidad.model';
import type { NucleoFamiliar } from '../../shared/models/nucleo-familiar.model';
import type { CensoEstadisticas } from '../../shared/models/censo-estadisticas.model';

@Injectable()
export abstract class PacientesService {
  abstract buscarPaciente(searchTerm: string, incluirInactivos?: boolean): Observable<Paciente[]>;
  abstract registrarPaciente(dto: CreatePacienteDto): Observable<Paciente>;
  abstract actualizarPaciente(id: number, dto: Partial<CreatePacienteDto>): Observable<Paciente>;
  abstract eliminarPaciente(id: number): Observable<{ success: boolean }>;
  abstract getPacienteById(id: number): Observable<Paciente>;
  abstract getPacienteByIdEmergencia(idEmergencia: string): Observable<Paciente>;
  abstract getNucleo(pacienteId: number): Observable<Familiar[]>;
  abstract agregarFamiliar(pacienteId: number, targetPacienteId: number, relacion: string): Observable<unknown>;
  abstract quitarFamiliar(pacienteId: number, miembroId: number): Observable<{ success: boolean }>;

  abstract getPatologias(): Observable<Patologia[]>;
  abstract getNecesidades(): Observable<Necesidad[]>;
  abstract getEstadisticasCenso(): Observable<CensoEstadisticas>;
  abstract crearCarpa(dto: { ubicacion?: string }): Observable<NucleoFamiliar>;
  abstract listarCarpas(): Observable<NucleoFamiliar[]>;
  abstract listarCarpasConMiembros(): Observable<NucleoFamiliar[]>;
  abstract getCarpaByCodigo(codigo: string): Observable<NucleoFamiliar>;
  abstract agregarMiembroCarpa(codigoCarpa: string, pacienteId: number, relacion?: string): Observable<unknown>;
  abstract actualizarCarpa(codigoCarpa: string, dto: { ubicacion?: string }): Observable<NucleoFamiliar>;
  abstract eliminarCarpa(codigoCarpa: string): Observable<{ success: boolean }>;
}
