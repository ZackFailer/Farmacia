import type { Paciente } from './paciente.model';
import type { Medicamento } from './medicamento.model';

export type RecetaEstado = 'pendiente' | 'despachada' | 'cancelada';

export interface RecetaDetalle {
  id: number;
  receta_id: number;
  medicamento_id: number;
  medicamento?: Medicamento;
  cantidad_recetada?: number;
  dias: number;
  dosis_indicada?: string;
  created_at: string;
}

export interface Receta {
  id: number;
  paciente_id: number;
  paciente?: Paciente;
  doctor_id: number;
  doctor?: { id: number; nombre: string; rol: string };
  fecha_hora: string;
  estado: RecetaEstado;
  activo: boolean;
  motivo?: string;
  detalles: RecetaDetalle[];
  created_at: string;
}

export interface CreateRecetaDto {
  paciente_id: number;
  motivo?: string;
  detalles: {
    medicamento_id: number;
    cantidad_recetada?: number;
    dias: number;
    dosis_indicada?: string;
  }[];
}
