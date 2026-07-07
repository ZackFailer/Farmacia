/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { InventarioService } from './inventario.service';
import type { StockItem, Movimiento } from '../../shared/models/stock-item.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

const MEDICAMENTOS: Medicamento[] = [
  { id: 1, nombre_generico: 'Amoxicilina', presentacion: 'Cápsula', concentracion: 500, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 2, nombre_generico: 'Paracetamol', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 3, nombre_generico: 'Insulina NPH', presentacion: 'Inyectable', concentracion: 100, unidad_concentracion: 'UI', created_at: '', updated_at: '' },
  { id: 4, nombre_generico: 'Ibuprofeno', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 5, nombre_generico: 'Salbutamol', presentacion: 'Inhalador', concentracion: 200, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 6, nombre_generico: 'Omeprazol', presentacion: 'Cápsula', concentracion: 20, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 7, nombre_generico: 'Dexametasona', presentacion: 'Inyectable', concentracion: 8, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 8, nombre_generico: 'Doxiciclina', presentacion: 'Tableta', concentracion: 100, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 9, nombre_generico: 'Loperamida', presentacion: 'Tableta', concentracion: 2, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 10, nombre_generico: 'Solución Salina', presentacion: 'Solución', concentracion: 500, unidad_concentracion: 'ml', created_at: '', updated_at: '' },
  { id: 11, nombre_generico: 'Morfina', presentacion: 'Inyectable', concentracion: 10, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 12, nombre_generico: 'Diazepam', presentacion: 'Inyectable', concentracion: 10, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 13, nombre_generico: 'Metronidazol', presentacion: 'Tableta', concentracion: 500, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 14, nombre_generico: 'Hidrocortisona', presentacion: 'Crema', concentracion: 1, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
  { id: 15, nombre_generico: 'Albendazol', presentacion: 'Tableta', concentracion: 400, unidad_concentracion: 'mg', created_at: '', updated_at: '' },
];

const CONFIGURACIONES: Configuracion[] = MEDICAMENTOS.map(m => ({
  id: m.id,
  medicamento_id: m.id,
  medicamento: m,
  umbral_minimo: m.es_vital ? 50 : 20,
  dosis_maxima_mg_kg: m.id === 1 ? 10 : m.id === 2 ? 15 : undefined,
  peso_referencia_kg: m.id === 1 ? 70 : m.id === 2 ? 70 : undefined,
  updated_at: '',
}));

const STOCK_ITEMS: StockItem[] = MEDICAMENTOS.map(m => {
  const conf = CONFIGURACIONES.find(c => c.medicamento_id === m.id)!;
  const stock = m.id * 37 + 10;
  return {
    medicamento: m,
    stock_total: stock,
    umbral_minimo: conf.umbral_minimo,
    color: stock === 0 ? 'red' : stock <= conf.umbral_minimo ? 'yellow' : 'green',
    proximo_vencer: '2026-12-31',
    cantidad_lotes: Math.ceil(stock / 100),
  };
});

const MOVIMIENTOS: Record<number, Movimiento[]> = {
  1: [
    { id: 1, lote_id: 1, tipo: 'ingreso', cantidad: 500, fecha: '2026-07-01T10:00:00Z', descripcion: 'Ingreso inicial' },
    { id: 2, lote_id: 1, tipo: 'dispensacion', cantidad: -30, fecha: '2026-07-02T14:30:00Z', descripcion: 'Dispensación #1' },
    { id: 3, lote_id: 1, tipo: 'ajuste', cantidad: -5, fecha: '2026-07-03T09:00:00Z', descripcion: 'Conteo físico' },
  ],
};

@Injectable()
export class MockInventarioService extends InventarioService {
  getStockGeneral(params?: { search?: string; ubicacion?: string }): Observable<StockItem[]> {
    let items = [...STOCK_ITEMS];
    if (params?.search) {
      const term = params.search.toLowerCase();
      items = items.filter(i => i.medicamento.nombre_generico.toLowerCase().includes(term));
    }
    const vitales = items.filter(i => i.medicamento.es_vital === true);
    const otros = items.filter(i => i.medicamento.es_vital !== true);
    return of([...vitales, ...otros]);
  }

  getProximosVencer(): Observable<Lote[]> {
    return of([]);
  }

  ajustarStock(loteId: number, cantidadReal: number): Observable<Lote> {
    return of({ id: loteId, medicamento_id: 1, codigo_qr: '', cantidad_inicial: 0, cantidad_actual: cantidadReal, fecha_vencimiento: '', created_at: '', updated_at: '' });
  }

  getMovimientosLote(loteId: number): Observable<Movimiento[]> {
    return of(MOVIMIENTOS[loteId] ?? []);
  }

  getUmbrales(): Observable<Configuracion[]> {
    return of([...CONFIGURACIONES]);
  }

  actualizarUmbral(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion> {
    const conf = CONFIGURACIONES.find(c => c.id === id);
    if (!conf) return throwError(() => new Error('No encontrado'));
    Object.assign(conf, dto);
    return of({ ...conf });
  }
}
