import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { AdministracionService } from './administracion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { CreateUsuarioDto, UpdateUsuarioDto, Usuario } from '../../shared/models/usuario.model';
import type { Rol } from '../../shared/enums/rol.enum';

interface ApiMedicamento {
  id: number;
  nombreGenerico: string;
  nombreComercial: string | null;
  presentacion: string;
  concentracion: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiUsuario {
  id: number;
  nombre: string;
  rol: Rol;
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
  updatedAt: string;
}

@Injectable()
export class ApiAdministracionService extends AdministracionService {
  constructor(private readonly http: HttpClient) {
    super();
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http
      .get<ApiUsuario[]>(`${API_BASE_URL}/usuarios`)
      .pipe(map((items) => items.map((item) => this.toUsuario(item))));
  }

  crearUsuario(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http
      .post<ApiUsuario>(`${API_BASE_URL}/usuarios`, {
        nombre: dto.nombre,
        rol: dto.rol,
        pin: dto.pin,
      })
      .pipe(map((item) => this.toUsuario(item)));
  }

  actualizarUsuario(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http
      .patch<ApiUsuario>(`${API_BASE_URL}/usuarios/${id}`, {
        nombre: dto.nombre,
        rol: dto.rol,
        pin: dto.pin,
      })
      .pipe(map((item) => this.toUsuario(item)));
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean }>(`${API_BASE_URL}/usuarios/${id}`)
      .pipe(map(() => void 0));
  }

  getConfiguraciones(): Observable<Configuracion[]> {
    return this.http
      .get<ApiConfiguracion[]>(`${API_BASE_URL}/configuraciones`)
      .pipe(map((items) => items.map((item) => this.toConfiguracion(item))));
  }

  actualizarConfiguracion(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion> {
    return this.http
      .patch<ApiConfiguracion>(`${API_BASE_URL}/configuraciones/${id}`, {
        umbralMinimo: dto.umbral_minimo,
        dosisMaximaMgKg: dto.dosis_maxima_mg_kg,
        pesoReferenciaKg: dto.peso_referencia_kg,
      })
      .pipe(map((item) => this.toConfiguracion(item)));
  }

  private toUsuario(item: ApiUsuario): Usuario {
    return {
      id: item.id,
      nombre: item.nombre,
      rol: item.rol,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  private toConfiguracion(item: ApiConfiguracion): Configuracion {
    return {
      id: item.id,
      medicamento_id: item.medicamentoId,
      medicamento: item.medicamento
        ? {
            id: item.medicamento.id,
            nombre_generico: item.medicamento.nombreGenerico,
            nombre_comercial: item.medicamento.nombreComercial ?? undefined,
            presentacion: item.medicamento.presentacion,
            concentracion: item.medicamento.concentracion,
            unidad_concentracion: 'mg',
            created_at: item.medicamento.createdAt,
            updated_at: item.medicamento.updatedAt,
          }
        : undefined,
      umbral_minimo: item.umbralMinimo,
      dosis_maxima_mg_kg: item.dosisMaximaMgKg,
      peso_referencia_kg: item.pesoReferenciaKg,
      updated_at: item.updatedAt,
    };
  }
}
