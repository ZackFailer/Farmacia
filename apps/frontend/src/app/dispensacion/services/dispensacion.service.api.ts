import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { DispensacionService } from './dispensacion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
import type { Configuracion } from '../../shared/models/configuracion.model';
import type { CreateDispensacionDto, Dispensacion } from '../../shared/models/dispensacion.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { CreatePacienteDto, Paciente } from '../../shared/models/paciente.model';

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

interface ApiPaciente {
  id: number;
  idEmergencia: string;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  esDamnificado: boolean;
  createdAt: string;
}

interface ApiDispensacionDetalle {
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
  paciente?: ApiPaciente;
  detalles?: ApiDispensacionDetalle[];
}

interface ApiConfiguracion {
  id: number;
  medicamentoId: number;
  umbralMinimo: number;
  dosisMaximaMgKg: number;
  pesoReferenciaKg: number;
  updatedAt: string;
}

@Injectable()
export class ApiDispensacionService extends DispensacionService {
  constructor(private readonly http: HttpClient) {
    super();
  }

  registrarPaciente(dto: CreatePacienteDto): Observable<Paciente> {
    return this.http
      .post<ApiPaciente>(`${API_BASE_URL}/pacientes`, {
        idEmergencia: dto.id_emergencia,
        sexo: dto.sexo,
        edadEstimada: dto.edad_estimada,
        pesoEstimado: dto.peso_estimado,
        esDamnificado: dto.es_damnificado,
      })
      .pipe(map((item) => this.toPaciente(item, dto.nombre, dto.apellido)));
  }

  buscarPaciente(searchTerm: string): Observable<Paciente> {
    return this.http
      .get<ApiPaciente>(`${API_BASE_URL}/pacientes/${encodeURIComponent(searchTerm)}`)
      .pipe(map((item) => this.toPaciente(item)));
  }

  buscarMedicamentos(search: string): Observable<Medicamento[]> {
    const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    return this.http
      .get<ApiMedicamento[]>(`${API_BASE_URL}/medicamentos${query}`)
      .pipe(map((items) => items.map((item) => this.toMedicamento(item))));
  }

  getLotesDisponibles(medicamentoId: number): Observable<Lote[]> {
    return this.http
      .get<ApiLote[]>(`${API_BASE_URL}/lotes/disponibles/${medicamentoId}`)
      .pipe(map((items) => items.map((item) => this.toLote(item))));
  }

  getLoteByQR(codigoQR: string): Observable<Lote> {
    return this.http
      .get<ApiLote[]>(`${API_BASE_URL}/lotes?limit=200`)
      .pipe(
        map((items) => items.map((item) => this.toLote(item))),
        map((items) => {
          const lote = items.find((item) => item.codigo_qr === codigoQR);
          if (!lote) {
            throw new Error('Lote no encontrado');
          }
          return lote;
        }),
      );
  }

  getLimiteDosis(medicamentoId: number): Observable<Configuracion | null> {
    return this.http
      .get<ApiConfiguracion>(`${API_BASE_URL}/configuraciones/${medicamentoId}/dosis`)
      .pipe(map((item) => this.toConfiguracion(item)));
  }

  crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion> {
    return this.http
      .post<ApiDispensacion>(`${API_BASE_URL}/dispensaciones`, {
        pacienteId: dto.paciente_id,
        observaciones: dto.observaciones,
        detalles: dto.items.map((item) => ({
          loteId: item.lote_id,
          medicamentoId: item.medicamento_id,
          cantidad: item.cantidad,
        })),
      })
      .pipe(map((item) => this.toDispensacion(item)));
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

  private toPaciente(item: ApiPaciente, nombre = '', apellido = ''): Paciente {
    return {
      id: item.id,
      id_emergencia: item.idEmergencia,
      nombre: nombre || item.idEmergencia,
      apellido,
      sexo: item.sexo,
      edad_estimada: item.edadEstimada,
      peso_estimado: item.pesoEstimado,
      es_damnificado: item.esDamnificado,
      created_at: item.createdAt,
    };
  }

  private toDispensacion(item: ApiDispensacion): Dispensacion {
    return {
      id: item.id,
      paciente_id: item.pacienteId,
      usuario_id: item.usuarioId,
      fecha_hora: item.fechaHora,
      observaciones: item.observaciones ?? undefined,
      paciente: item.paciente ? this.toPaciente(item.paciente) : undefined,
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

  private toConfiguracion(item: ApiConfiguracion): Configuracion {
    return {
      id: item.id,
      medicamento_id: item.medicamentoId,
      umbral_minimo: item.umbralMinimo,
      dosis_maxima_mg_kg: item.dosisMaximaMgKg,
      peso_referencia_kg: item.pesoReferenciaKg,
      updated_at: item.updatedAt,
    };
  }
}
