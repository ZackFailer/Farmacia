import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { StockItem, Movimiento } from '../../shared/models/stock-item.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';

@Injectable()
export abstract class InventarioService {
  abstract getStockGeneral(params?: { search?: string; ubicacion?: string }): Observable<StockItem[]>;
  abstract getProximosVencer(): Observable<Lote[]>;
  abstract ajustarStock(loteId: number, cantidadReal: number): Observable<Lote>;
  abstract getMovimientosLote(loteId: number): Observable<Movimiento[]>;
  abstract getUmbrales(): Observable<Configuracion[]>;
  abstract actualizarUmbral(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion>;
}
