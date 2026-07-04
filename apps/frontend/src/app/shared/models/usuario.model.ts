import type { Rol } from '../enums/rol.enum';

export interface Usuario {
  id: number;
  nombre: string;
  rol: Rol;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDto {
  nombre: string;
  rol: Rol;
  pin: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  rol?: Rol;
  pin?: string;
}
