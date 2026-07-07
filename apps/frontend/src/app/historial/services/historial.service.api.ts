import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { HistorialService } from './historial.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
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
  esDamnificado: boolean;
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
  loteId: number;
  medicamentoId: number;
  cantidad: number;
  dosisMgKg: number;
  createdAt: string;
  medicamento?: ApiMedicamento;
  lote?: ApiLote;
}

interface ApiDispensacion {
  id: number;
  pacienteId: number;
  usuarioId: number;
  fechaHora: string;
  observaciones: string | null;
  recetaId: number | null;
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
    return {
      id: item.id,
      paciente_id: item.pacienteId,
      usuario_id: item.usuarioId,
      fecha_hora: item.fechaHora,
      observaciones: item.observaciones ?? undefined,
      receta_id: item.recetaId ?? undefined,
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
            es_damnificado: item.paciente.esDamnificado,
            tiene_carga_familiar: item.paciente.tieneCargaFamiliar,
            created_at: item.paciente.createdAt,
          }
        : undefined,
      items: (item.detalles ?? []).map((detalle) => ({
        id: detalle.id,
        dispensacion_id: detalle.dispensacionId,
        lote_id: detalle.loteId,
        medicamento_id: detalle.medicamentoId,
        medicamento_nombre: detalle.medicamento?.nombreGenerico,
        lote_codigo: detalle.lote?.codigoQr,
        cantidad: detalle.cantidad,
        dosis_mg_kg: detalle.dosisMgKg,
        created_at: detalle.createdAt,
      })),
    };
  }
}
