import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Usuario } from '../../shared/models/usuario.model';

const APP_STORAGE_PREFIX = 'apoPharma_';

export function clearAppSessionStorage(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(APP_STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));

  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(APP_STORAGE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

@Injectable()
export abstract class AuthService {
  abstract login(pin: string): Observable<{ token: string; usuario: Usuario }>;
  abstract logout(): void;
  abstract getToken(): string | null;
  abstract getUsuario(): Usuario | null;
  abstract isLoggedIn(): boolean;
  abstract getMe(): Observable<Usuario>;
}
