import type { Medicamento } from './medicamento.model';

export interface Lote {
  id: number;
  medicamento_id: number;
  medicamento?: Medicamento;
  codigo_qr: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  fecha_vencimiento: string;
  donante?: string;
  ubicacion?: string;
  created_at: string;
  updated_at: string;
}
