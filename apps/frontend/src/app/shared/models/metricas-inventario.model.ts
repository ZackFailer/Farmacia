export interface EgresoPorDia {
  fecha: string;
  total: number;
}

export interface MedicamentoMasDispensado {
  medicamento: string;
  medicamentoId: number;
  totalDosis: number;
  pacientes: number;
}

export interface MetricasInventario {
  pacientesAtendidosTotal: number;
  pacientesAtendidosHoy: number;
  pacientesAtendidosSemana: number;
  dosisTotales: number;
  promedioDosisPorDia: number;
  egresosPorDia: EgresoPorDia[];
  medicamentosMasDispensados: MedicamentoMasDispensado[];
  medicamentosSinMovimientos: { id: number; nombre: string; ultimaDispensacion?: string }[];
  totalMedicamentos: number;
}
