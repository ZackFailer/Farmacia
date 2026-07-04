import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Receta, CreateRecetaDto, RecetaEstado } from '../../shared/models/receta.model';

@Injectable()
export abstract class RecetasService {
  abstract crearReceta(dto: CreateRecetaDto): Observable<Receta>;
  abstract getReceta(id: number): Observable<Receta>;
  abstract getRecetasPendientes(): Observable<Receta[]>;
  abstract getRecetasByPaciente(pacienteId: number): Observable<Receta[]>;
  abstract updateEstado(id: number, estado: RecetaEstado): Observable<Receta>;
}
