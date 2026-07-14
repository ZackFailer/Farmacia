import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { AdministracionService, type ParametroSistema } from './administracion.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { CreateUsuarioDto, UpdateUsuarioDto, Usuario } from '../../shared/models/usuario.model';
import type { Patologia, CreatePatologiaDto } from '../../shared/models/patologia.model';
import type { Necesidad, CreateNecesidadDto } from '../../shared/models/necesidad.model';
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
  username: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
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

@Injectable()
export class ApiAdministracionService extends AdministracionService {
  private readonly http = inject(HttpClient);

  getUsuarios(incluirInactivos?: boolean): Observable<Usuario[]> {
    const url = incluirInactivos ? `${API_BASE_URL}/usuarios?incluirInactivos=true` : `${API_BASE_URL}/usuarios`;
    return this.http
      .get<ApiUsuario[]>(url)
      .pipe(map((items) => items.map((item) => this.toUsuario(item))));
  }

  crearUsuario(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http
      .post<ApiUsuario>(`${API_BASE_URL}/usuarios`, {
        username: dto.username,
        nombre: dto.nombre,
        rol: dto.rol,
        pin: dto.pin,
      })
      .pipe(map((item) => this.toUsuario(item)));
  }

  actualizarUsuario(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http
      .patch<ApiUsuario>(`${API_BASE_URL}/usuarios/${id}`, {
        username: dto.username,
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

  getPatologias(): Observable<Patologia[]> {
    return this.http.get<Patologia[]>(`${API_BASE_URL}/patologias`);
  }

  crearPatologia(dto: CreatePatologiaDto): Observable<Patologia> {
    return this.http.post<Patologia>(`${API_BASE_URL}/patologias`, dto);
  }

  actualizarPatologia(id: number, dto: Partial<CreatePatologiaDto>): Observable<Patologia> {
    return this.http.patch<Patologia>(`${API_BASE_URL}/patologias/${id}`, dto);
  }

  eliminarPatologia(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_BASE_URL}/patologias/${id}`);
  }

  getNecesidades(): Observable<Necesidad[]> {
    return this.http.get<Necesidad[]>(`${API_BASE_URL}/necesidades`);
  }

  crearNecesidad(dto: CreateNecesidadDto): Observable<Necesidad> {
    return this.http.post<Necesidad>(`${API_BASE_URL}/necesidades`, dto);
  }

  actualizarNecesidad(id: number, dto: Partial<CreateNecesidadDto>): Observable<Necesidad> {
    return this.http.patch<Necesidad>(`${API_BASE_URL}/necesidades/${id}`, dto);
  }

  eliminarNecesidad(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${API_BASE_URL}/necesidades/${id}`);
  }

  private toUsuario(item: ApiUsuario): Usuario {
    return {
      id: item.id,
      username: item.username,
      nombre: item.nombre,
      rol: item.rol,
      activo: item.activo,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    };
  }

  getParametros(): Observable<ParametroSistema[]> {
    return this.http.get<ParametroSistema[]>(`${API_BASE_URL}/parametros`);
  }

  updateParametro(clave: string, valor: string): Observable<ParametroSistema> {
    return this.http.patch<ParametroSistema>(`${API_BASE_URL}/parametros/${encodeURIComponent(clave)}`, { valor });
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
      activo: item.activo,
      updated_at: item.updatedAt,
    };
  }
}
