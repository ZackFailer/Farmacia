import type { Rol } from '../enums/rol.enum';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: Rol;
  activo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUsuarioDto {
  username: string;
  nombre: string;
  rol: Rol;
  pin: string;
}

export interface UpdateUsuarioDto {
  username?: string;
  nombre?: string;
  rol?: Rol;
  pin?: string;
  activo?: boolean;
}
