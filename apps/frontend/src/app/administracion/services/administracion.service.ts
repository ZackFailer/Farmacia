import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../shared/models/usuario.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';

@Injectable()
export abstract class AdministracionService {
  abstract getUsuarios(): Observable<Usuario[]>;
  abstract crearUsuario(dto: CreateUsuarioDto): Observable<Usuario>;
  abstract actualizarUsuario(id: number, dto: UpdateUsuarioDto): Observable<Usuario>;
  abstract eliminarUsuario(id: number): Observable<void>;
  abstract getConfiguraciones(): Observable<Configuracion[]>;
  abstract actualizarConfiguracion(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion>;
}
