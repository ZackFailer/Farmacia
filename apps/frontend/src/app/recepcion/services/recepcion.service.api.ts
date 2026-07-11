import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { RecepcionService } from './recepcion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Medicamento } from '../../shared/models/medicamento.model';

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

}
