import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { RecetasService } from './recetas.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Rol } from '../../shared/enums/rol.enum';
import type { CreateRecetaDto, Receta, RecetaDetalle, RecetaEstado } from '../../shared/models/receta.model';
import type { Medicamento } from '../../shared/models/medicamento.model';

interface ApiRecetaDetalle {
  id: number;
  recetaId: number;
  medicamentoId: number;
  medicamento?: ApiMedicamento;
  cantidadRecetada: number;
  dias: number;
  dosisIndicada: string | null;
  createdAt: string;
}

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiReceta {
  id: number;
  pacienteId: number;
  doctorId: number;
  doctor?: { id: number; nombre: string; rol: Rol };
  fechaHora: string;
  estado: string;
  activo: boolean;
  detalles: ApiRecetaDetalle[];
  createdAt: string;
}

@Injectable()
export class ApiRecetasService extends RecetasService {
  private readonly http = inject(HttpClient);

  crearReceta(dto: CreateRecetaDto): Observable<Receta> {
    return this.http
      .post<ApiReceta>(`${API_BASE_URL}/recetas`, {
        pacienteId: dto.paciente_id,
        detalles: dto.detalles.map((det) => ({
          medicamentoId: det.medicamento_id,
          cantidadRecetada: det.cantidad_recetada,
          dias: det.dias,
          dosisIndicada: det.dosis_indicada,
        })),
      })
      .pipe(map((item) => this.toReceta(item)));
  }

  getReceta(id: number): Observable<Receta> {
    return this.http
      .get<ApiReceta>(`${API_BASE_URL}/recetas/${id}`)
      .pipe(map((item) => this.toReceta(item)));
  }

  getRecetasPendientes(): Observable<Receta[]> {
    return this.http
      .get<ApiReceta[]>(`${API_BASE_URL}/recetas/pendientes`)
      .pipe(map((items) => items.map((item) => this.toReceta(item))));
  }

  getRecetasByPaciente(pacienteId: number): Observable<Receta[]> {
    return this.http
      .get<ApiReceta[]>(`${API_BASE_URL}/recetas/paciente/${pacienteId}`)
      .pipe(map((items) => items.map((item) => this.toReceta(item))));
  }

  updateEstado(id: number, estado: RecetaEstado): Observable<Receta> {
    return this.http
      .patch<ApiReceta>(`${API_BASE_URL}/recetas/${id}/estado`, { estado })
      .pipe(map((item) => this.toReceta(item)));
  }

  private toReceta(item: ApiReceta): Receta {
    return {
      id: item.id,
      paciente_id: item.pacienteId,
      doctor_id: item.doctorId,
      doctor: item.doctor,
      fecha_hora: item.fechaHora,
      estado: item.estado as RecetaEstado,
      activo: item.activo,
      detalles: item.detalles.map((d) => this.toDetalle(d)),
      created_at: item.createdAt,
    };
  }

  private toDetalle(item: ApiRecetaDetalle): RecetaDetalle {
    return {
      id: item.id,
      receta_id: item.recetaId,
      medicamento_id: item.medicamentoId,
      medicamento: item.medicamento ? this.toMedicamento(item.medicamento) : undefined,
      cantidad_recetada: item.cantidadRecetada,
      dias: item.dias,
      dosis_indicada: item.dosisIndicada ?? undefined,
      created_at: item.createdAt,
    };
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
}
