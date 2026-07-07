import type { Medicamento } from './medicamento.model';

export interface Configuracion {
  id: number;
  medicamento_id: number;
  medicamento?: Medicamento;
  umbral_minimo: number;
  dosis_maxima_mg_kg?: number;
  peso_referencia_kg?: number;
  activo?: boolean;
  updated_at: string;
}

export interface UpdateConfiguracionDto {
  umbral_minimo?: number;
  dosis_maxima_mg_kg?: number;
  peso_referencia_kg?: number;
}
