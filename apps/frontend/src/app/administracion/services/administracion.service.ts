import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../shared/models/usuario.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import type { Patologia, CreatePatologiaDto } from '../../shared/models/patologia.model';
import type { Necesidad, CreateNecesidadDto } from '../../shared/models/necesidad.model';

@Injectable()
export abstract class AdministracionService {
  abstract getUsuarios(incluirInactivos?: boolean): Observable<Usuario[]>;
  abstract crearUsuario(dto: CreateUsuarioDto): Observable<Usuario>;
  abstract actualizarUsuario(id: number, dto: UpdateUsuarioDto): Observable<Usuario>;
  abstract eliminarUsuario(id: number): Observable<void>;
  abstract getConfiguraciones(): Observable<Configuracion[]>;
  abstract actualizarConfiguracion(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion>;

  abstract getPatologias(): Observable<Patologia[]>;
  abstract crearPatologia(dto: CreatePatologiaDto): Observable<Patologia>;
  abstract actualizarPatologia(id: number, dto: Partial<CreatePatologiaDto>): Observable<Patologia>;
  abstract eliminarPatologia(id: number): Observable<{ success: boolean }>;

  abstract getNecesidades(): Observable<Necesidad[]>;
  abstract crearNecesidad(dto: CreateNecesidadDto): Observable<Necesidad>;
  abstract actualizarNecesidad(id: number, dto: Partial<CreateNecesidadDto>): Observable<Necesidad>;
  abstract eliminarNecesidad(id: number): Observable<{ success: boolean }>;
}
