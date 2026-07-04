import type { Sexo } from '../enums/sexo.enum';

export interface Paciente {
  id: number;
  id_emergencia: string;
  nombre: string;
  apellido: string;
  sexo: Sexo;
  edad_estimada: number;
  peso_estimado: number;
  es_damnificado: boolean;
  created_at: string;
}

export interface CreatePacienteDto {
  id_emergencia: string;
  nombre: string;
  apellido: string;
  sexo: Sexo;
  edad_estimada: number;
  peso_estimado: number;
  es_damnificado: boolean;
}
