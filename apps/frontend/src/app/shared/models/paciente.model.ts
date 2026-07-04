import type { Sexo } from '../enums/sexo.enum';
import type { Familiar } from './familiar.model';

export interface Paciente {
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
  es_titular?: boolean;
  familiares?: Familiar[];
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
  peso_estimado: number;
  es_damnificado: boolean;
  tiene_carga_familiar?: boolean;
  familiares?: CreateFamiliarDto[];
}

export interface CreateFamiliarDto {
  nombre: string;
  apellido?: string;
  cedula?: string;
  sexo: Sexo;
  edad_estimada: number;
  peso_estimado: number;
  es_damnificado: boolean;
  relacion: string;
}
