import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Usuario } from '../../shared/models/usuario.model';

@Injectable()
export abstract class AuthService {
  abstract login(pin: string): Observable<{ token: string; usuario: Usuario }>;
  abstract logout(): void;
  abstract getToken(): string | null;
  abstract getUsuario(): Usuario | null;
  abstract isLoggedIn(): boolean;
  abstract getMe(): Observable<Usuario>;
}
