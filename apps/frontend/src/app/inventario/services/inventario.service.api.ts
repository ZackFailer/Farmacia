import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { InventarioService } from './inventario.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Movimiento, StockItem } from '../../shared/models/stock-item.model';

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiLote {
  id: number;
  medicamentoId: number;
  medicamento?: ApiMedicamento;
  codigoQr: string;
  cantidadInicial: number;
  cantidadActual: number;
  fechaVencimiento: string;
  donante: string | null;
  ubicacion: string | null;
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

interface ApiMovimiento {
  id: number;
  loteId: number;
  tipo: 'inbound' | 'dispensation' | 'adjustment';
  cantidad: number;
  motivo: string | null;
  createdAt: string;
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

@Injectable()
export class ApiInventarioService extends InventarioService {
  private readonly http = inject(HttpClient);

  getStockGeneral(params?: {
    search?: string;
    ubicacion?: string;
  }): Observable<StockItem[]> {
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

  getProximosVencer(): Observable<Lote[]> {
    return this.http
      .get<ApiLote[]>(`${API_BASE_URL}/inventario/proximos-vencer`)
      .pipe(map((items) => items.map((item) => this.toLote(item))));
  }

  ajustarStock(loteId: number, cantidadReal: number): Observable<Lote> {
    return this.http
      .patch<ApiLote>(`${API_BASE_URL}/lotes/${loteId}/ajustar-stock`, {
        cantidadReal,
      })
      .pipe(map((item) => this.toLote(item)));
  }

  getMovimientosLote(loteId: number): Observable<Movimiento[]> {
    return this.http
      .get<ApiMovimiento[]>(`${API_BASE_URL}/lotes/${loteId}/movimientos`)
      .pipe(map((items) => items.map((item) => this.toMovimiento(item))));
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

  private toMedicamento(item: ApiMedicamento): Medicamento {
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

  private toLote(item: ApiLote): Lote {
    return {
      id: item.id,
      medicamento_id: item.medicamentoId,
      medicamento: item.medicamento ? this.toMedicamento(item.medicamento) : undefined,
      codigo_qr: item.codigoQr,
      cantidad_inicial: item.cantidadInicial,
      cantidad_actual: item.cantidadActual,
      fecha_vencimiento: item.fechaVencimiento,
      donante: item.donante ?? undefined,
      ubicacion: item.ubicacion ?? undefined,
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

  private toMovimiento(item: ApiMovimiento): Movimiento {
    return {
      id: item.id,
      lote_id: item.loteId,
      tipo:
        item.tipo === 'inbound'
          ? 'ingreso'
          : item.tipo === 'dispensation'
            ? 'dispensacion'
            : 'ajuste',
      cantidad: item.cantidad,
      fecha: item.createdAt,
      descripcion: item.motivo ?? undefined,
    };
  }

  private toColor(
    cantidad: number,
    umbral: number,
  ): 'green' | 'yellow' | 'red' {
    if (cantidad <= 0) {
      return 'red';
    }

    if (cantidad <= umbral) {
      return 'yellow';
    }

    return 'green';
  }
}
