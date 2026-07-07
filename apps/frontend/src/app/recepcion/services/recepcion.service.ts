import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';

@Injectable()
export abstract class RecepcionService {
  abstract getMedicamentos(search?: string, incluirInactivos?: boolean): Observable<Medicamento[]>;
  abstract crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento>;
  abstract actualizarMedicamento(id: number, dto: Partial<Medicamento>): Observable<Medicamento>;
  abstract eliminarMedicamento(id: number): Observable<void>;
  abstract getLotes(page?: number, limit?: number, incluirInactivos?: boolean): Observable<Lote[]>;
  abstract crearLote(dto: Partial<Lote>): Observable<Lote>;
  abstract actualizarLote(id: number, dto: Partial<Lote>): Observable<Lote>;
  abstract getLoteById(id: number): Observable<Lote>;
  abstract getLoteQR(id: number): Observable<Blob>;
}
