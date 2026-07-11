/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { InventarioService } from './inventario.service';
import type { StockItem } from '../../shared/models/stock-item.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { MetricasInventario } from '../../shared/models/metricas-inventario.model';

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

@Injectable()
export class MockInventarioService extends InventarioService {
  getStockGeneral(params?: { search?: string }): Observable<StockItem[]> {
    let items = [...STOCK_ITEMS];
    if (params?.search) {
      const term = params.search.toLowerCase();
      items = items.filter(i => i.medicamento.nombre_generico.toLowerCase().includes(term));
    }
    const vitales = items.filter(i => i.medicamento.es_vital === true);
    const otros = items.filter(i => i.medicamento.es_vital !== true);
    return of([...vitales, ...otros]);
  }

  getMetricas(): Observable<MetricasInventario> {
    return of({
      pacientesAtendidosTotal: 42,
      pacientesAtendidosHoy: 5,
      pacientesAtendidosSemana: 18,
      dosisTotales: 156,
      promedioDosisPorDia: 7.8,
      egresosPorDia: [
        { fecha: '2026-07-03', total: 12 },
        { fecha: '2026-07-04', total: 8 },
        { fecha: '2026-07-05', total: 15 },
        { fecha: '2026-07-06', total: 10 },
        { fecha: '2026-07-07', total: 6 },
        { fecha: '2026-07-08', total: 14 },
        { fecha: '2026-07-09', total: 9 },
      ],
      medicamentosMasDispensados: [
        { medicamento: 'Paracetamol', medicamentoId: 2, totalDosis: 45, pacientes: 20 },
        { medicamento: 'Amoxicilina', medicamentoId: 1, totalDosis: 32, pacientes: 15 },
        { medicamento: 'Ibuprofeno', medicamentoId: 4, totalDosis: 28, pacientes: 12 },
        { medicamento: 'Salbutamol', medicamentoId: 5, totalDosis: 18, pacientes: 8 },
        { medicamento: 'Omeprazol', medicamentoId: 6, totalDosis: 12, pacientes: 7 },
      ],
      medicamentosSinMovimientos: [
        { id: 14, nombre: 'Hidrocortisona' },
        { id: 15, nombre: 'Albendazol' },
      ],
      totalMedicamentos: 15,
    });
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
