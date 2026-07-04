import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import type { Usuario } from '../../shared/models/usuario.model';
import { Rol } from '../../shared/enums/rol.enum';

const SEED_USUARIO: Usuario = {
  id: 1,
  nombre: 'Administrador',
  rol: Rol.FARMACEUTICO,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const SEED_PIN = '123456';
const TOKEN_FAKE = 'mock-jwt-token-apoPharma-2026';

@Injectable()
export class MockAuthService extends AuthService {
  login(pin: string): Observable<{ token: string; usuario: Usuario }> {
    if (pin === SEED_PIN) {
      const payload = { token: TOKEN_FAKE, usuario: SEED_USUARIO };
      localStorage.setItem('apoPharma_token', TOKEN_FAKE);
      localStorage.setItem('apoPharma_usuario', JSON.stringify(SEED_USUARIO));
      return of(payload);
    }
    return throwError(() => new Error('PIN inválido'));
  }

  logout(): void {
    localStorage.removeItem('apoPharma_token');
    localStorage.removeItem('apoPharma_usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('apoPharma_token');
  }

  getUsuario(): Usuario | null {
    const raw = localStorage.getItem('apoPharma_usuario');
    return raw ? (JSON.parse(raw) as Usuario) : null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getMe(): Observable<Usuario> {
    const usuario = this.getUsuario();
    if (usuario) return of(usuario);
    return throwError(() => new Error('No autenticado'));
  }
}
