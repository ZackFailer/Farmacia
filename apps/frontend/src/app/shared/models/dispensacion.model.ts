import type { Paciente } from './paciente.model';

export interface DispensacionDetalle {
  id: number;
  dispensacion_id: number;
  lote_id: number;
  medicamento_id: number;
  medicamento_nombre?: string;
  lote_codigo?: string;
  cantidad: number;
  dosis_mg_kg?: number;
  created_at: string;
}

export interface Dispensacion {
  id: number;
  paciente_id: number;
  usuario_id: number;
  fecha_hora: string;
  observaciones?: string;
  items: DispensacionDetalle[];
  despachado_por?: string;
  paciente?: Paciente;
}

export interface CreateDispensacionDetalleDto {
  lote_id: number;
  medicamento_id: number;
  cantidad: number;
}

export interface CreateDispensacionDto {
  paciente_id: number;
  receta_id?: number;
  observaciones?: string;
  items: CreateDispensacionDetalleDto[];
}
