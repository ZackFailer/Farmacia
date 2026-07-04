import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Paciente, CreatePacienteDto } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';

@Injectable()
export abstract class PacientesService {
  abstract buscarPaciente(searchTerm: string): Observable<Paciente>;
  abstract registrarPaciente(dto: CreatePacienteDto): Observable<Paciente>;
  abstract actualizarPaciente(id: number, dto: Partial<CreatePacienteDto>): Observable<Paciente>;
  abstract eliminarPaciente(id: number): Observable<{ success: boolean }>;
  abstract getPacienteById(id: number): Observable<Paciente>;
  abstract getPacienteByIdEmergencia(idEmergencia: string): Observable<Paciente>;
  abstract getNucleo(pacienteId: number): Observable<Familiar[]>;
  abstract agregarFamiliar(pacienteId: number, targetPacienteId: number, relacion: string): Observable<unknown>;
  abstract quitarFamiliar(pacienteId: number, miembroId: number): Observable<{ success: boolean }>;
}
