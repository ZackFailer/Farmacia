export interface Medicamento {
  id: number;
  nombre_generico: string;
  nombre_comercial?: string;
  presentacion: string;
  concentracion: number;
  unidad_concentracion: 'mg' | 'ml' | 'UI';
  created_at: string;
  updated_at: string;
}
