import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { InventarioService } from './inventario.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { MetricasInventario } from '../../shared/models/metricas-inventario.model';
import type { StockItem } from '../../shared/models/stock-item.model';

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiConfiguracion {
  id: number;
  medicamentoId: number;
  medicamento?: ApiMedicamento;
  umbralMinimo: number;
  dosisMaximaMgKg: number;
  pesoReferenciaKg: number;
  activo: boolean;
  updatedAt: string;
}

interface ApiInventarioRow {
  medicamentoId: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  umbralMinimo: number;
  stockTotal: string;
  proximoVencimiento: string;
}

interface ApiMetricas {
  pacientesAtendidosTotal: number;
  pacientesAtendidosHoy: number;
  pacientesAtendidosSemana: number;
  dosisTotales: number;
  promedioDosisPorDia: number;
  egresosPorDia: { fecha: string; total: number }[];
  medicamentosMasDispensados: { medicamento: string; medicamentoId: number; totalDosis: number; pacientes: number }[];
  medicamentosSinMovimientos: { id: number; nombre: string; ultimaDispensacion?: string }[];
  totalMedicamentos: number;
}

@Injectable()
export class ApiInventarioService extends InventarioService {
  private readonly http = inject(HttpClient);

  getStockGeneral(params?: { search?: string }): Observable<StockItem[]> {
    const query = params?.search?.trim()
      ? `?search=${encodeURIComponent(params.search.trim())}`
      : '';

    return this.http.get<ApiInventarioRow[]>(`${API_BASE_URL}/inventario${query}`).pipe(
      map((rows) =>
        rows.map((row) => {
          const stockTotal = Number(row.stockTotal ?? 0);
          const umbral = Number(row.umbralMinimo ?? 0);
          return {
            medicamento: {
              id: row.medicamentoId,
              nombre_generico: row.nombreGenerico,
              nombre_comercial: row.nombreComercial ?? undefined,
              presentacion: row.presentacion,
              concentracion: Number(row.concentracion ?? 0),
              unidad_concentracion: 'mg',
              created_at: '',
              updated_at: '',
            },
            stock_total: stockTotal,
            umbral_minimo: umbral,
            color: this.toColor(stockTotal, umbral),
            proximo_vencer: row.proximoVencimiento,
            cantidad_lotes: 0,
          } satisfies StockItem;
        }),
      ),
    );
  }

  getMetricas(): Observable<MetricasInventario> {
    return this.http.get<ApiMetricas>(`${API_BASE_URL}/inventario/metricas`).pipe(
      map((data) => ({
        pacientesAtendidosTotal: data.pacientesAtendidosTotal,
        pacientesAtendidosHoy: data.pacientesAtendidosHoy,
        pacientesAtendidosSemana: data.pacientesAtendidosSemana,
        dosisTotales: data.dosisTotales,
        promedioDosisPorDia: data.promedioDosisPorDia,
        egresosPorDia: data.egresosPorDia.map((e) => ({ fecha: e.fecha, total: e.total })),
        medicamentosMasDispensados: data.medicamentosMasDispensados.map((m) => ({
          medicamento: m.medicamento,
          medicamentoId: m.medicamentoId,
          totalDosis: m.totalDosis,
          pacientes: m.pacientes,
        })),
        medicamentosSinMovimientos: data.medicamentosSinMovimientos.map((m) => ({
          id: m.id,
          nombre: m.nombre,
          ultimaDispensacion: m.ultimaDispensacion,
        })),
        totalMedicamentos: data.totalMedicamentos,
      })),
    );
  }

  getUmbrales(): Observable<Configuracion[]> {
    return this.http
      .get<ApiConfiguracion[]>(`${API_BASE_URL}/configuraciones/umbrales`)
      .pipe(map((items) => items.map((item) => this.toConfiguracion(item))));
  }

  actualizarUmbral(medicamentoId: number, dto: UpdateConfiguracionDto): Observable<Configuracion> {
    return this.http
      .patch<ApiConfiguracion>(`${API_BASE_URL}/configuraciones/medicamento/${medicamentoId}/umbral`, {
        umbralMinimo: dto.umbral_minimo,
      })
      .pipe(map((item) => this.toConfiguracion(item)));
  }

  private toMedicamento(item: ApiMedicamento): {
    id: number; nombre_generico: string; nombre_comercial?: string;
    presentacion: string; concentracion: number; unidad_concentracion: 'mg';
    created_at: string; updated_at: string;
  } {
    return {
      id: item.id,
      nombre_generico: item.nombreGenerico,
      nombre_comercial: item.nombreComercial ?? undefined,
      presentacion: item.presentacion,
      concentracion: item.concentracion,
      unidad_concentracion: 'mg',
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private toConfiguracion(item: ApiConfiguracion): Configuracion {
    return {
      id: item.id,
      medicamento_id: item.medicamentoId,
      medicamento: item.medicamento ? this.toMedicamento(item.medicamento) : undefined,
      umbral_minimo: item.umbralMinimo,
      dosis_maxima_mg_kg: item.dosisMaximaMgKg,
      peso_referencia_kg: item.pesoReferenciaKg,
      activo: item.activo,
      updated_at: item.updatedAt,
    };
  }

  private toColor(cantidad: number, umbral: number): 'green' | 'yellow' | 'red' {
    if (cantidad <= 0) return 'red';
    if (cantidad <= umbral) return 'yellow';
    return 'green';
  }
}
