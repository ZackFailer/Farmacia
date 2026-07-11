import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { StockItem } from '../../shared/models/stock-item.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { MetricasInventario } from '../../shared/models/metricas-inventario.model';

@Injectable()
export abstract class InventarioService {
  abstract getStockGeneral(params?: { search?: string }): Observable<StockItem[]>;
  abstract getMetricas(): Observable<MetricasInventario>;
  abstract getUmbrales(): Observable<Configuracion[]>;
  abstract actualizarUmbral(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion>;
}
