import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Dispensacion } from '../../shared/models/dispensacion.model';

@Injectable()
export abstract class HistorialService {
  abstract getHistorialPaciente(pacienteId: number | string): Observable<Dispensacion[]>;
  abstract getDetalleDispensacion(id: number): Observable<Dispensacion>;
}
