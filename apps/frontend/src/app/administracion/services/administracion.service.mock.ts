import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { AdministracionService } from './administracion.service';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../../shared/models/usuario.model';
import type { Configuracion, UpdateConfiguracionDto } from '../../shared/models/configuracion.model';
import { Rol } from '../../shared/enums/rol.enum';

let usuarios: Usuario[] = [
  { id: 1, nombre: 'Administrador', rol: Rol.ADMIN, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, nombre: 'Carlos Ruiz', rol: Rol.RECEPTIONIST, created_at: '2026-06-15T00:00:00Z', updated_at: '2026-06-15T00:00:00Z' },
  { id: 3, nombre: 'María López', rol: Rol.RECEPTIONIST, created_at: '2026-06-20T00:00:00Z', updated_at: '2026-06-20T00:00:00Z' },
];

const configuraciones: Configuracion[] = [
  { id: 1, medicamento_id: 1, umbral_minimo: 100, dosis_maxima_mg_kg: 15, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
  { id: 2, medicamento_id: 2, umbral_minimo: 200, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
  { id: 3, medicamento_id: 3, umbral_minimo: 50, dosis_maxima_mg_kg: 10, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
  { id: 4, medicamento_id: 4, umbral_minimo: 30, updated_at: '2026-01-01T00:00:00Z' },
  { id: 5, medicamento_id: 5, umbral_minimo: 20, updated_at: '2026-01-01T00:00:00Z' },
  { id: 6, medicamento_id: 6, umbral_minimo: 50, updated_at: '2026-01-01T00:00:00Z' },
  { id: 7, medicamento_id: 7, umbral_minimo: 40, dosis_maxima_mg_kg: 0.2, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
  { id: 8, medicamento_id: 8, umbral_minimo: 60, dosis_maxima_mg_kg: 2, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
  { id: 9, medicamento_id: 9, umbral_minimo: 200, updated_at: '2026-01-01T00:00:00Z' },
  { id: 10, medicamento_id: 10, umbral_minimo: 80, dosis_maxima_mg_kg: 7.5, peso_referencia_kg: 70, updated_at: '2026-01-01T00:00:00Z' },
];

const medicamentosNombres: Record<number, string> = {
  1: 'Amoxicilina', 2: 'Paracetamol', 3: 'Ibuprofeno', 4: 'Loratadina',
  5: 'Salbutamol', 6: 'Omeprazol', 7: 'Dexametasona', 8: 'Diclofenaco',
  9: 'Suero Oral', 10: 'Metronidazol',
};

let nextUserId = 4;
let pinStore: Record<number, string> = { 1: '123456', 2: '654321', 3: '111222' };

@Injectable()
export class MockAdministracionService extends AdministracionService {
  private configsConMedicamento(): Configuracion[] {
    return configuraciones.map(c => ({
      ...c,
      medicamento: {
        id: c.medicamento_id,
        nombre_generico: medicamentosNombres[c.medicamento_id] ?? 'Desconocido',
        presentacion: '',
        concentracion: 0,
        unidad_concentracion: 'mg' as const,
        created_at: '',
        updated_at: '',
      },
    }));
  }

  getUsuarios(): Observable<Usuario[]> {
    return of([...usuarios]);
  }

  crearUsuario(dto: CreateUsuarioDto): Observable<Usuario> {
    if (!dto.nombre?.trim()) return throwError(() => new Error('El nombre es requerido'));
    if (!dto.pin || dto.pin.length < 4 || dto.pin.length > 6) {
      return throwError(() => new Error('El PIN debe tener entre 4 y 6 dígitos'));
    }
    const nuevo: Usuario = {
      id: nextUserId++,
      nombre: dto.nombre.trim(),
      rol: dto.rol,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    usuarios.push(nuevo);
    pinStore[nuevo.id] = dto.pin;
    return of(nuevo);
  }

  actualizarUsuario(id: number, dto: UpdateUsuarioDto): Observable<Usuario> {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return throwError(() => new Error('Usuario no encontrado'));
    if (dto.nombre !== undefined) usuarios[idx] = { ...usuarios[idx], nombre: dto.nombre };
    if (dto.rol !== undefined) usuarios[idx] = { ...usuarios[idx], rol: dto.rol };
    if (dto.pin !== undefined) {
      if (dto.pin.length < 4 || dto.pin.length > 6) {
        return throwError(() => new Error('El PIN debe tener entre 4 y 6 dígitos'));
      }
      pinStore[id] = dto.pin;
    }
    usuarios[idx] = { ...usuarios[idx], updated_at: new Date().toISOString() };
    return of({ ...usuarios[idx] });
  }

  eliminarUsuario(id: number): Observable<void> {
    const idx = usuarios.findIndex(u => u.id === id);
    if (idx === -1) return throwError(() => new Error('Usuario no encontrado'));
    const admins = usuarios.filter(u => u.rol === Rol.ADMIN);

    if (admins.length <= 1 && usuarios[idx].rol === Rol.ADMIN) {
      return throwError(() => new Error('No se puede eliminar el último administrador'));
    }

    usuarios.splice(idx, 1);
    return of(void 0);
  }

  getConfiguraciones(): Observable<Configuracion[]> {
    return of(this.configsConMedicamento());
  }

  actualizarConfiguracion(id: number, dto: UpdateConfiguracionDto): Observable<Configuracion> {
    const idx = configuraciones.findIndex(c => c.id === id);
    if (idx === -1) return throwError(() => new Error('Configuración no encontrada'));
    configuraciones[idx] = { ...configuraciones[idx], ...dto, updated_at: new Date().toISOString() };
    return of({ ...this.configsConMedicamento()[idx] });
  }
}
