import type { Sexo } from '../enums/sexo.enum';

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
  es_damnificado: boolean;
  tiene_carga_familiar: boolean;
  relacion: string;
  es_titular?: boolean;
  created_at: string;
}
