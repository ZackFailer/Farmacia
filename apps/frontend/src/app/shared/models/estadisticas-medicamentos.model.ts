export interface DistribucionSexoEdad {
  sexo: string;
  rango: string;
  count: number;
}

export interface EstadisticasMedicamentos {
  totalPacientes: number;
  totalMedicamentos: number;
  totalDispensaciones: number;
  totalDosis: number;
  promedioDosisPorDia: number;
  fechaActual: string;
  horaCierre: string;
  distribucionSexoEdad: DistribucionSexoEdad[];
  medicamentosMasDispensados: {
    medicamento: string;
    medicamentoId: number;
    presentacion: string;
    concentracion: string;
    totalDosis: number;
    pacientes: number;
  }[];
  medicamentosSinMovimientos: {
    id: number;
    nombre: string;
  }[];
}
