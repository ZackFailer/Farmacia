import type { Sexo } from '../enums/sexo.enum';
import type { SituacionVivienda } from '../enums/situacion-vivienda.enum';
import type { Familiar } from './familiar.model';

import type { Patologia } from './patologia.model';
import type { Necesidad } from './necesidad.model';
import type { Usuario } from './usuario.model';

export interface PacienteNecesidad {
  id: number;
  necesidadId: number;
  necesidad: Necesidad;
  suplida: boolean;
  fechaSuplida?: string;
  suplidaPorId?: number;
  suplidaPor?: Usuario;
  activo?: boolean;
  createdAt?: string;
}

export interface Paciente {
  id: number;
  id_emergencia: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  sexo: Sexo;
  edad_estimada: number;
  fecha_nacimiento?: string;
  edad_manual?: number;
  es_recien_nacido?: boolean;
  peso_estimado: number;
  situacion_vivienda: SituacionVivienda;
  tiene_carga_familiar: boolean;
  tiene_discapacidad_motora?: boolean;
  es_titular?: boolean;
  codigo_carpa?: string;
  familiares?: Familiar[];
  pacientePatologias?: { id: number; patologiaId: number; tratamiento?: string; patologia: Patologia }[];
  pacienteNecesidades?: PacienteNecesidad[];
  activo?: boolean;
  created_at: string;
}

export interface CreatePacienteDto {
  id_emergencia?: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  telefono?: string;
  sexo: Sexo;
  edad_estimada: number;
  fecha_nacimiento?: string;
  edad_manual?: number;
  es_recien_nacido?: boolean;
  peso_estimado: number;
  situacion_vivienda: SituacionVivienda;
  tiene_carga_familiar?: boolean;
  tiene_discapacidad_motora?: boolean;
  patologiaIds?: number[];
  patologias?: { patologiaId: number; tratamiento?: string }[];
  necesidadIds?: number[];
  familiares?: CreateFamiliarDto[];
}

export interface CreateFamiliarDto {
  nombre: string;
  apellido?: string;
  cedula?: string;
  telefono?: string;
  sexo: Sexo;
  edad_estimada: number;
  fecha_nacimiento?: string;
  edad_manual?: number;
  es_recien_nacido?: boolean;
  peso_estimado: number;
  situacion_vivienda: SituacionVivienda;
  tiene_discapacidad_motora?: boolean;
  patologiaIds?: number[];
  patologias?: { patologiaId: number; tratamiento?: string }[];
  necesidadIds?: number[];
  relacion: string;
}
