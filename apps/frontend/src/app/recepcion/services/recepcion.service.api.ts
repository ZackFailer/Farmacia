import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { RecepcionService } from './recepcion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { Lote } from '../../shared/models/lote.model';

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  unidadConcentracion: string;
  esVital: boolean;
  activo: boolean;
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
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ApiRecepcionService extends RecepcionService {
  private readonly http = inject(HttpClient);

  getMedicamentos(search?: string, incluirInactivos?: boolean): Observable<Medicamento[]> {
    const params = new URLSearchParams();
    if (search?.trim()) params.set('search', search.trim());
    if (incluirInactivos) params.set('incluirInactivos', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.http
      .get<ApiMedicamento[]>(`${API_BASE_URL}/medicamentos${query}`)
      .pipe(map((items) => items.map((item) => this.toMedicamento(item))));
  }

  crearMedicamento(dto: Partial<Medicamento>): Observable<Medicamento> {
    return this.http
      .post<ApiMedicamento>(`${API_BASE_URL}/medicamentos`, {
        nombreGenerico: dto.nombre_generico,
        nombreComercial: dto.nombre_comercial,
        presentacion: dto.presentacion,
        concentracion: dto.concentracion,
        unidadConcentracion: dto.unidad_concentracion,
        esVital: dto.es_vital,
      })
      .pipe(map((item) => this.toMedicamento(item)));
  }

  actualizarMedicamento(id: number, dto: Partial<Medicamento>): Observable<Medicamento> {
    return this.http
      .patch<ApiMedicamento>(`${API_BASE_URL}/medicamentos/${id}`, {
        nombreGenerico: dto.nombre_generico,
        nombreComercial: dto.nombre_comercial,
        presentacion: dto.presentacion,
        concentracion: dto.concentracion,
        unidadConcentracion: dto.unidad_concentracion,
        esVital: dto.es_vital,
      })
      .pipe(map((item) => this.toMedicamento(item)));
  }

  eliminarMedicamento(id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${API_BASE_URL}/medicamentos/${id}`)
      .pipe(map(() => void 0));
  }

  getLotes(page = 1, limit = 20, incluirInactivos?: boolean): Observable<Lote[]> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (incluirInactivos) params.set('incluirInactivos', 'true');
    const query = `?${params.toString()}`;
    return this.http
      .get<ApiLote[]>(`${API_BASE_URL}/lotes${query}`)
      .pipe(map((items) => items.map((item) => this.toLote(item))));
  }

  crearLote(dto: Partial<Lote>): Observable<Lote> {
    return this.http
      .post<ApiLote>(`${API_BASE_URL}/lotes`, {
        medicamentoId: dto.medicamento_id,
        cantidadInicial: dto.cantidad_inicial,
        fechaVencimiento: dto.fecha_vencimiento,
        donante: dto.donante,
        ubicacion: dto.ubicacion,
      })
      .pipe(map((item) => this.toLote(item)));
  }

  actualizarLote(id: number, dto: Partial<Lote>): Observable<Lote> {
    return this.http
      .patch<ApiLote>(`${API_BASE_URL}/lotes/${id}`, {
        fechaVencimiento: dto.fecha_vencimiento,
        donante: dto.donante,
        ubicacion: dto.ubicacion,
      })
      .pipe(map((item) => this.toLote(item)));
  }

  getLoteById(id: number): Observable<Lote> {
    return this.http
      .get<ApiLote>(`${API_BASE_URL}/lotes/${id}`)
      .pipe(map((item) => this.toLote(item)));
  }

  getLoteQR(id: number): Observable<Blob> {
    return this.http
      .get<{ codigoQr: string }>(`${API_BASE_URL}/lotes/${id}/qr`)
      .pipe(map((qr) => this.buildQrBlob(qr.codigoQr)));
  }

  private toMedicamento(item: ApiMedicamento): Medicamento {
    return {
      id: item.id,
      nombre_generico: item.nombreGenerico,
      nombre_comercial: item.nombreComercial ?? undefined,
      presentacion: item.presentacion,
      concentracion: item.concentracion,
      unidad_concentracion: item.unidadConcentracion as 'mg' | 'ml' | 'UI',
      es_vital: item.esVital,
      activo: item.activo,
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
      activo: item.activo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private buildQrBlob(code: string): Blob {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="260" height="60">
  <rect width="100%" height="100%" fill="#ffffff" />
  <text x="16" y="38" font-size="16" font-family="monospace" fill="#111111">${code}</text>
</svg>`;
    return new Blob([svg], { type: 'image/svg+xml' });
  }
}
