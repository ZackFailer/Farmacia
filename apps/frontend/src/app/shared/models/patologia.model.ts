export interface Patologia {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreatePatologiaDto {
  nombre: string;
  descripcion?: string;
}
