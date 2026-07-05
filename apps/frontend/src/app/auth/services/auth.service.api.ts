import { HttpClient } from '@angular/common/http';
import { Injectable, signal, type WritableSignal } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { clearAppSessionStorage } from './auth.service';
import { API_BASE_URL } from '../../core/services/api.constants';
import { Rol } from '../../shared/enums/rol.enum';
import type { Usuario } from '../../shared/models/usuario.model';

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    rol: Rol;
    createdAt?: string;
    updatedAt?: string;
  };
}

@Injectable()
export class ApiAuthService extends AuthService {
  readonly usuario$: WritableSignal<Usuario | null>;

  constructor(private readonly http: HttpClient) {
    super();
    this.usuario$ = signal<Usuario | null>(this.getUsuario());
  }

  login(pin: string): Observable<{ token: string; usuario: Usuario }> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, { pin }).pipe(
      map((response) => ({
        token: response.token,
        usuario: this.toUsuario(response.usuario),
      })),
      tap((response) => {
        localStorage.setItem('apoPharma_token', response.token);
        localStorage.setItem('apoPharma_usuario', JSON.stringify(response.usuario));
        this.usuario$.set(response.usuario);
      }),
    );
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
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getMe(): Observable<Usuario> {
    return this.http.get<LoginResponse['usuario']>(`${API_BASE_URL}/auth/me`).pipe(
      map((user) => this.toUsuario(user)),
      tap((user) => {
        localStorage.setItem('apoPharma_usuario', JSON.stringify(user));
        this.usuario$.set(user);
      }),
    );
  }

  private toUsuario(user: LoginResponse['usuario']): Usuario {
    const now = new Date().toISOString();
    return {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol,
      created_at: user.createdAt ?? now,
      updated_at: user.updatedAt ?? now,
    };
  }
}
