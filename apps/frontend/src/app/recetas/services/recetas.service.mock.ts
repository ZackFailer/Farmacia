import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { RecetasService } from './recetas.service';
import type { Receta, CreateRecetaDto, RecetaEstado } from '../../shared/models/receta.model';

let nextRecetaId = 1;
const recetas: Receta[] = [];

@Injectable()
export class MockRecetasService extends RecetasService {
  crearReceta(dto: CreateRecetaDto): Observable<Receta> {
    const receta: Receta = {
      id: nextRecetaId++,
      paciente_id: dto.paciente_id,
      doctor_id: 1,
      fecha_hora: new Date().toISOString(),
      estado: 'pendiente',
      activo: true,
      detalles: dto.detalles.map((det, i) => ({
        id: i + 1,
        receta_id: nextRecetaId - 1,
        medicamento_id: det.medicamento_id,
        cantidad_recetada: det.cantidad_recetada,
        dias: det.dias,
        dosis_indicada: det.dosis_indicada,
        created_at: new Date().toISOString(),
      })),
      created_at: new Date().toISOString(),
    };
    recetas.push(receta);
    return of(receta);
  }

  getReceta(id: number): Observable<Receta> {
    const r = recetas.find((rec) => rec.id === id);
    if (!r) return throwError(() => new Error('Receta not found'));
    return of(r);
  }

  getRecetasPendientes(): Observable<Receta[]> {
    return of(recetas.filter((r) => r.estado === 'pendiente'));
  }

  getRecetasByPaciente(pacienteId: number): Observable<Receta[]> {
    return of(recetas.filter((r) => r.paciente_id === pacienteId));
  }

  updateEstado(id: number, estado: RecetaEstado): Observable<Receta> {
    const r = recetas.find((rec) => rec.id === id);
    if (!r) return throwError(() => new Error('Receta not found'));
    r.estado = estado;
    return of(r);
  }
}
