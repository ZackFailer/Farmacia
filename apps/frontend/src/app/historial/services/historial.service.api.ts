import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { HistorialService } from './historial.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
import { SituacionVivienda } from '../../shared/enums/situacion-vivienda.enum';
import type { Dispensacion } from '../../shared/models/dispensacion.model';

interface ApiPaciente {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  situacionVivienda: string;
  tieneCargaFamiliar: boolean;
  createdAt: string;
}

interface ApiUsuario {
  id: number;
  nombre: string;
}

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
}

interface ApiLote {
  id: number;
  codigoQr: string;
}

interface ApiDetalle {
  id: number;
  dispensacionId: number;
  loteId?: number;
  medicamentoId: number;
  cantidad: number;
  dosisMgKg: number;
  createdAt: string;
  medicamento?: ApiMedicamento;
  lote?: ApiLote;
}

interface ApiRecetaDetalleHistorial {
  id: number;
  medicamentoId: number;
  dias?: number;
  dosisIndicada: string | null;
  medicamento?: ApiMedicamento;
}

interface ApiRecetaHistorial {
  id: number;
  motivo: string | null;
  detalles: ApiRecetaDetalleHistorial[];
}

interface ApiDispensacion {
  id: number;
  pacienteId: number;
  usuarioId: number;
  fechaHora: string;
  observaciones: string | null;
  recetaId: number | null;
  receta?: ApiRecetaHistorial;
  activo: boolean;
  paciente?: ApiPaciente;
  usuario?: ApiUsuario;
  detalles?: ApiDetalle[];
}

@Injectable()
export class ApiHistorialService extends HistorialService {
  private readonly http = inject(HttpClient);

  getHistorialPaciente(idEmergencia: string): Observable<Dispensacion[]> {
    return this.http
      .get<ApiDispensacion[]>(`${API_BASE_URL}/pacientes/${encodeURIComponent(idEmergencia)}/dispensaciones`)
      .pipe(map((items) => items.map((item) => this.toDispensacion(item))));
  }

  getDetalleDispensacion(id: number): Observable<Dispensacion> {
    return this.http
      .get<ApiDispensacion>(`${API_BASE_URL}/dispensaciones/${id}`)
      .pipe(map((item) => this.toDispensacion(item)));
  }

  private toDispensacion(item: ApiDispensacion): Dispensacion {
    const recetaDetalles = item.receta?.detalles ?? [];
    return {
      id: item.id,
      paciente_id: item.pacienteId,
      usuario_id: item.usuarioId,
      fecha_hora: item.fechaHora,
      observaciones: item.observaciones ?? undefined,
      receta_id: item.recetaId ?? undefined,
      receta_motivo: item.receta?.motivo ?? undefined,
      activo: item.activo,
      despachado_por: item.usuario?.nombre,
      paciente: item.paciente
        ? {
            id: item.paciente.id,
            id_emergencia: item.paciente.idEmergencia,
            nombre: item.paciente.nombre,
            apellido: item.paciente.apellido,
            cedula: item.paciente.cedula ?? undefined,
            sexo: item.paciente.sexo,
            edad_estimada: item.paciente.edadEstimada,
            peso_estimado: item.paciente.pesoEstimado,
            situacion_vivienda: item.paciente.situacionVivienda as SituacionVivienda,
            tiene_carga_familiar: item.paciente.tieneCargaFamiliar,
            created_at: item.paciente.createdAt,
          }
        : undefined,
      items: (item.detalles ?? []).map((detalle) => {
        const recetaDet = recetaDetalles.find(
          (rd) => rd.medicamentoId === detalle.medicamentoId,
        );
        return {
          id: detalle.id,
          dispensacion_id: detalle.dispensacionId,
          medicamento_id: detalle.medicamentoId,
          medicamento_nombre: detalle.medicamento?.nombreGenerico,
          cantidad: detalle.cantidad,
          dias: recetaDet?.dias ?? undefined,
          dosis_mg_kg: detalle.dosisMgKg,
          dosis_indicada: recetaDet?.dosisIndicada ?? undefined,
          created_at: detalle.createdAt,
        };
      }),
    };
  }
}
