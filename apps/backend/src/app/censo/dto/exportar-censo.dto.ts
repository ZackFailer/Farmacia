export interface ExportarCensoResponse {
  metrica: {
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
    porPatologia: { id: number; nombre: string; count: number }[];
    porNecesidad: { id: number; nombre: string; count: number }[];
    porUbicacion: { ubicacion: string; count: number }[];
  };
  pacientes: PacienteExportRow[];
  metricaMedicamentos: {
    totalMedicamentos: number;
    totalDispensaciones: number;
    totalDosis: number;
    promedioDosisPorDia: number;
    medicamentosMasDispensados: {
      medicamento: string;
      medicamentoId: number;
      presentacion: string;
      concentracion: string;
      totalDosis: number;
      pacientes: number;
    }[];
    medicamentosSinMovimientos: { id: number; nombre: string }[];
  };
  dispensaciones: DispensacionExportRow[];
}

export interface PacienteExportRow {
  carpa: string;
  ubicacion: string | null;
  idEmergencia: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  telefono: string | null;
  sexo: string;
  edadEstimada: number;
  pesoEstimado: number;
  situacionVivienda: string;
  tieneDiscapacidadMotora: boolean;
  relacion: string;
  patologias: { nombre: string; tratamiento?: string }[];
  necesidades: { nombre: string; suplida: boolean }[];
}

export interface DispensacionExportRow {
  id: number;
  fechaHora: string;
  idEmergencia: string;
  pacienteNombre: string;
  pacienteApellido: string;
  cedula: string | null;
  sexo: string;
  edadEstimada: number;
  despachadoPor: string;
  items: {
    medicamento: string;
    presentacion: string;
    concentracion: string;
    cantidad: number;
    dosisMgKg: number;
  }[];
}
