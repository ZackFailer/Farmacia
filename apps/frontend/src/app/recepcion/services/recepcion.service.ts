import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';

@Injectable()
export abstract class RecepcionService {
  abstract getMedicamentos(search?: string): Observable<Medicamento[]>;
  abstract crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento>;
  abstract getLotes(page?: number, limit?: number): Observable<Lote[]>;
  abstract crearLote(dto: Partial<Lote>): Observable<Lote>;
  abstract getLoteQR(id: number): Observable<Blob>;
}
