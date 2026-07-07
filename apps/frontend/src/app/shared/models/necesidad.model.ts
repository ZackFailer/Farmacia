export interface Necesidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateNecesidadDto {
  nombre: string;
  descripcion?: string;
}
