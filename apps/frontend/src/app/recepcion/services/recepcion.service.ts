import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Medicamento } from '../../shared/models/medicamento.model';

@Injectable()
export abstract class RecepcionService {
  abstract getMedicamentos(search?: string, incluirInactivos?: boolean): Observable<Medicamento[]>;
  abstract crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento>;
  abstract actualizarMedicamento(id: number, dto: Partial<Medicamento>): Observable<Medicamento>;
  abstract eliminarMedicamento(id: number): Observable<void>;
}
