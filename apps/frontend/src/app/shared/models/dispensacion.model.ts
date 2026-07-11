import type { Paciente } from './paciente.model';

export interface DispensacionDetalle {
  id: number;
  dispensacion_id: number;
  medicamento_id: number;
  medicamento_nombre?: string;
  cantidad: number;
  dias?: number;
  dosis_mg_kg?: number;
  dosis_indicada?: string;
  created_at: string;
}

export interface Dispensacion {
  id: number;
  paciente_id: number;
  usuario_id: number;
  fecha_hora: string;
  observaciones?: string;
  receta_id?: number;
  receta_motivo?: string;
  activo?: boolean;
  items: DispensacionDetalle[];
  despachado_por?: string;
  paciente?: Paciente;
}

export interface CreateDispensacionDetalleDto {
  medicamento_id: number;
  cantidad: number;
}

export interface CreateDispensacionDto {
  paciente_id: number;
  receta_id?: number;
  observaciones?: string;
  items: CreateDispensacionDetalleDto[];
}
