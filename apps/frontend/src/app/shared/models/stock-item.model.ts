import type { Medicamento } from './medicamento.model';

export interface StockItem {
  medicamento: Medicamento;
  stock_total: number;
  umbral_minimo: number;
  color: 'green' | 'yellow' | 'red';
  proximo_vencer: string;
  cantidad_lotes: number;
}

export interface Movimiento {
  id: number;
  lote_id: number;
  tipo: 'ingreso' | 'dispensacion' | 'ajuste';
  cantidad: number;
  fecha: string;
  descripcion?: string;
}
