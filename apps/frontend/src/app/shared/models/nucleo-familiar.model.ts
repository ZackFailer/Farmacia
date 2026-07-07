import type { Paciente } from './paciente.model';

export interface NucleoFamiliar {
  id: number;
  codigoCarpa?: string;
  ubicacion?: string;
  titular?: Paciente;
  miembros?: NucleoMiembro[];
  activo?: boolean;
  createdAt?: string;
}

export interface NucleoMiembro {
  id: number;
  pacienteId: number;
  relacion: string;
  paciente?: Paciente;
  activo?: boolean;
}
