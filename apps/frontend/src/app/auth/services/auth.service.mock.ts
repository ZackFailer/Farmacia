import { Injectable, signal, type WritableSignal } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { clearAppSessionStorage } from './auth.service';
import type { Usuario } from '../../shared/models/usuario.model';
import { Rol } from '../../shared/enums/rol.enum';

interface MockUser {
  username: string;
  pin: string;
  usuario: Usuario;
}

const SEED_USUARIOS: MockUser[] = [
  {
    username: 'admin',
    pin: '123456',
    usuario: {
      id: 1,
      username: 'admin',
      nombre: 'Administrador',
      rol: Rol.ADMIN,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
  {
    username: 'humber_farias',
    pin: '123456',
    usuario: {
      id: 2,
      username: 'humber_farias',
      nombre: 'Humberto Farías',
      rol: Rol.MEDICATION_RECEPTIONIST,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  },
];

const TOKEN_FAKE = 'mock-jwt-token-apoPharma-2026';

@Injectable()
export class MockAuthService extends AuthService {
  readonly usuario$: WritableSignal<Usuario | null> = signal<Usuario | null>(null);

  login(username: string, pin: string): Observable<{ token: string; usuario: Usuario }> {
    const match = SEED_USUARIOS.find(u => u.username === username && u.pin === pin);
    if (match) {
      const payload = { token: TOKEN_FAKE, usuario: match.usuario };
      localStorage.setItem('apoPharma_token', TOKEN_FAKE);
      localStorage.setItem('apoPharma_usuario', JSON.stringify(match.usuario));
      this.usuario$.set(match.usuario);
      return of(payload);
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    clearAppSessionStorage();
    this.usuario$.set(null);
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
