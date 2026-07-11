import type { Sexo } from '../enums/sexo.enum';
import type { SituacionVivienda } from '../enums/situacion-vivienda.enum';

export interface Familiar {
  id: number;
  id_emergencia: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  sexo: Sexo;
  edad_estimada: number;
  peso_estimado: number;
  situacion_vivienda: SituacionVivienda;
  tiene_carga_familiar: boolean;
  relacion: string;
  es_titular?: boolean;
  created_at: string;
}
