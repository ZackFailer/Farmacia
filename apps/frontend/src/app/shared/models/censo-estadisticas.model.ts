export interface CensoEstadisticas {
  totalPacientes: number;
  masculinos: number;
  femeninos: number;
  recienNacidos: number;
  preescolares: number;
  escolares: number;
  adolescentes: number;
  adultos: number;
  adultosMayores: number;
  conDiscapacidadMotora: number;
  totalCarpas: number;
  porPatologia: CatalogoCount[];
  porNecesidad: CatalogoCount[];
  porUbicacion: UbicacionCount[];
}

export interface CatalogoCount {
  id: number;
  nombre: string;
  count: number;
}

export interface UbicacionCount {
  ubicacion: string;
  count: string;
}
