import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { DispensacionService } from './dispensacion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Sexo } from '../../shared/enums/sexo.enum';
import { Rol } from '../../shared/enums/rol.enum';
import type { Configuracion } from '../../shared/models/configuracion.model';
import type { CreateDispensacionDto, Dispensacion } from '../../shared/models/dispensacion.model';
import type { Lote } from '../../shared/models/lote.model';
import type { Medicamento } from '../../shared/models/medicamento.model';
import type { CreatePacienteDto, Paciente } from '../../shared/models/paciente.model';
import type { Receta } from '../../shared/models/receta.model';

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

interface ApiNucleoMiembro {
  id: number;
  nucleoId: number;
  pacienteId: number;
  relacion: string;
  paciente: ApiPacienteSimple;
}

interface ApiPacienteSimple {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  createdAt: string;
}

interface ApiPaciente {
  id: number;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  sexo: Sexo;
  edadEstimada: number;
  pesoEstimado: number;
  esDamnificado: boolean;
  tieneCargaFamiliar: boolean;
  esTitular?: boolean;
  familiares?: ApiNucleoMiembro[];
  createdAt: string;
}

interface ApiRecetaDetalle {
  id: number;
  recetaId: number;
  medicamentoId: number;
  cantidadRecetada: number;
  dias: number;
  dosisIndicada: string | null;
  createdAt: string;
  medicamento?: ApiMedicamento;
}

interface ApiReceta {
  id: number;
  pacienteId: number;
  doctorId: number;
  fechaHora: string;
  estado: string;
  activo: boolean;
  createdAt: string;
  paciente?: ApiPaciente;
  doctor?: { id: number; nombre: string; rol: Rol };
  detalles?: ApiRecetaDetalle[];
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
    const body: Record<string, unknown> = {
      nombre: dto.nombre,
      apellido: dto.apellido,
      sexo: dto.sexo,
      edadEstimada: dto.edad_estimada,
      pesoEstimado: dto.peso_estimado,
      esDamnificado: dto.es_damnificado,
      tieneCargaFamiliar: dto.tiene_carga_familiar ?? false,
    };
    if (dto.id_emergencia) body['idEmergencia'] = dto.id_emergencia;
    if (dto.cedula) body['cedula'] = dto.cedula;
    if (dto.telefono) body['telefono'] = dto.telefono;
    if (dto.familiares?.length) {
      body['familiares'] = dto.familiares.map((f) => ({
        nombre: f.nombre,
        apellido: f.apellido,
        cedula: f.cedula,
        sexo: f.sexo,
        edadEstimada: f.edad_estimada,
        pesoEstimado: f.peso_estimado,
        esDamnificado: f.es_damnificado,
        relacion: f.relacion,
      }));
    }
    return this.http
      .post<ApiPaciente>(`${API_BASE_URL}/pacientes`, body)
      .pipe(map((item) => this.toPaciente(item)));
  }

  buscarPaciente(searchTerm: string): Observable<Paciente> {
    return this.http
      .get<ApiPaciente[]>(`${API_BASE_URL}/pacientes?q=${encodeURIComponent(searchTerm)}`)
      .pipe(
        map((items) => {
          if (!items.length) throw new Error('Paciente no encontrado');
          return this.toPaciente(items[0]);
        }),
      );
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

  getRecetasPendientes(): Observable<Receta[]> {
    return this.http
      .get<ApiReceta[]>(`${API_BASE_URL}/dispensaciones/pendientes`)
      .pipe(map((items) => items.map((item) => this.toReceta(item))));
  }

  crearDispensacion(dto: CreateDispensacionDto): Observable<Dispensacion> {
    const body: Record<string, unknown> = {
      pacienteId: dto.paciente_id,
      observaciones: dto.observaciones,
      detalles: dto.items.map((item) => ({
        loteId: item.lote_id,
        medicamentoId: item.medicamento_id,
        cantidad: item.cantidad,
      })),
    };
    if (dto.receta_id) body['recetaId'] = dto.receta_id;
    return this.http
      .post<ApiDispensacion>(`${API_BASE_URL}/dispensaciones`, body)
      .pipe(map((item) => this.toDispensacion(item)));
  }

  private toReceta(item: ApiReceta): Receta {
    return {
      id: item.id,
      paciente_id: item.pacienteId,
      paciente: item.paciente ? this.toPaciente(item.paciente) : undefined,
      doctor_id: item.doctorId,
      doctor: item.doctor,
      fecha_hora: item.fechaHora,
      estado: item.estado as Receta['estado'],
      activo: item.activo,
      created_at: item.createdAt,
      detalles: (item.detalles ?? []).map((d) => ({
        id: d.id,
        receta_id: d.recetaId,
        medicamento_id: d.medicamentoId,
        medicamento: d.medicamento ? this.toMedicamento(d.medicamento) : undefined,
        cantidad_recetada: d.cantidadRecetada,
        dias: d.dias,
        dosis_indicada: d.dosisIndicada ?? undefined,
        created_at: d.createdAt,
      })),
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

  private toFamiliar(pf: ApiNucleoMiembro) {
    return {
      id: pf.paciente.id,
      id_emergencia: pf.paciente.idEmergencia,
      nombre: pf.paciente.nombre,
      apellido: pf.paciente.apellido,
      cedula: pf.paciente.cedula ?? undefined,
      sexo: pf.paciente.sexo,
      edad_estimada: pf.paciente.edadEstimada,
      peso_estimado: pf.paciente.pesoEstimado,
      es_damnificado: pf.paciente.esDamnificado,
      tiene_carga_familiar: pf.paciente.tieneCargaFamiliar,
      relacion: pf.relacion,
      created_at: pf.paciente.createdAt,
    };
  }

  private toPaciente(item: ApiPaciente): Paciente {
    return {
      id: item.id,
      id_emergencia: item.idEmergencia,
      nombre: item.nombre,
      apellido: item.apellido,
      cedula: item.cedula ?? undefined,
      telefono: item.telefono ?? undefined,
      sexo: item.sexo,
      edad_estimada: item.edadEstimada,
      peso_estimado: item.pesoEstimado,
      es_damnificado: item.esDamnificado,
      tiene_carga_familiar: item.tieneCargaFamiliar,
      es_titular: item.esTitular,
      familiares: item.familiares?.map((pf) => this.toFamiliar(pf)),
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
