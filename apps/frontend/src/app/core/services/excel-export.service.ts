import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import type { ExportarCensoResponse } from '../../shared/models/exportar-censo.model';
import type { EstadisticasMedicamentos } from '../../shared/models/estadisticas-medicamentos.model';

const SITUACION_VIVIENDA_LABELS: Record<string, string> = {
  no_afectado: 'No afectado',
  vivienda_afectada: 'Vivienda afectada',
  damnificado: 'Damnificado',
};

function labelVivienda(value: string): string {
  return SITUACION_VIVIENDA_LABELS[value] ?? value;
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {
  async generarExcel(data: ExportarCensoResponse, filename: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ApoPharma';

    this.agregarHojaResumen(workbook, data.metrica);
    this.agregarHojaMedicamentos(workbook, data.metricaMedicamentos);
    this.agregarHojaPacientes(workbook, data.pacientes);
    this.agregarHojaDispensaciones(workbook, data.dispensaciones);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private agregarHojaResumen(
    workbook: ExcelJS.Workbook,
    metrica: ExportarCensoResponse['metrica'],
  ): void {
    const sheet = workbook.addWorksheet('Resumen Censo');
    const headerStyle: Partial<ExcelJS.Style> = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } }, font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } } };

    sheet.columns = [
      { header: 'Sección', key: 'seccion', width: 30 },
      { header: 'Métrica', key: 'metrica', width: 35 },
      { header: 'Valor', key: 'valor', width: 15 },
    ];
    sheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    const addRow = (seccion: string, metrica: string, valor: number | string) => {
      sheet.addRow({ seccion, metrica, valor: String(valor) });
    };

    addRow('Población General', 'Total pacientes', metrica.totalPacientes);
    addRow('Población General', 'Masculinos', metrica.masculinos);
    addRow('Población General', 'Femeninos', metrica.femeninos);
    addRow('Población General', 'Total carpas / familias', metrica.totalCarpas);
    sheet.addRow({});

    addRow('Situación de Vivienda', 'No afectados', metrica.totalNoAfectados);
    addRow('Situación de Vivienda', 'Vivienda afectada', metrica.totalViviendaAfectada);
    addRow('Situación de Vivienda', 'Damnificados', metrica.totalDamnificados);
    sheet.addRow({});

    addRow('Clasificación Etaria', 'Recién nacidos (0-28d)', metrica.recienNacidos);
    addRow('Clasificación Etaria', 'Preescolares (<5a)', metrica.preescolares);
    addRow('Clasificación Etaria', 'Escolares (6-10a)', metrica.escolares);
    addRow('Clasificación Etaria', 'Adolescentes (11-15a)', metrica.adolescentes);
    addRow('Clasificación Etaria', 'Adultos (16-59a)', metrica.adultos);
    addRow('Clasificación Etaria', 'Adultos mayores (60+)', metrica.adultosMayores);
    sheet.addRow({});

    addRow('Necesidades Especiales', 'Con discapacidad motora', metrica.conDiscapacidadMotora);
    sheet.addRow({});

    for (const item of metrica.porPatologia) {
      addRow('Por Patología', item.nombre, item.count);
    }
    if (metrica.porPatologia.length > 0) sheet.addRow({});

    for (const item of metrica.porNecesidad) {
      addRow('Por Necesidad', item.nombre, item.count);
    }
    if (metrica.porNecesidad.length > 0) sheet.addRow({});

    for (const item of metrica.porUbicacion) {
      addRow('Por Ubicación', item.ubicacion, item.count);
    }
  }

  private agregarHojaMedicamentos(
    workbook: ExcelJS.Workbook,
    metricaMed: ExportarCensoResponse['metricaMedicamentos'],
  ): void {
    const sheet = workbook.addWorksheet('Medicamentos');
    const headerStyle: Partial<ExcelJS.Style> = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } } };

    // Totals section
    sheet.columns = [
      { header: 'Sección', key: 'seccion', width: 25 },
      { header: 'Métrica', key: 'metrica', width: 35 },
      { header: 'Valor', key: 'valor', width: 15 },
    ];
    sheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    const addRow = (seccion: string, metrica: string, valor: number | string) => {
      sheet.addRow({ seccion, metrica, valor: String(valor) });
    };

    addRow('General', 'Total medicamentos', metricaMed.totalMedicamentos);
    addRow('General', 'Total dispensaciones', metricaMed.totalDispensaciones);
    addRow('General', 'Total dosis dispensadas', metricaMed.totalDosis);
    addRow('General', 'Promedio dosis por día', metricaMed.promedioDosisPorDia);

    if (metricaMed.medicamentosMasDispensados.length > 0) {
      sheet.addRow({});
      // Remove columns and recreate for top dispensed
      sheet.columns = [
        { header: 'Sección', key: 'seccion', width: 20 },
        { header: 'Medicamento', key: 'medicamento', width: 30 },
        { header: 'Presentación', key: 'presentacion', width: 20 },
        { header: 'Concentración', key: 'concentracion', width: 15 },
        { header: 'Dosis Totales', key: 'dosis', width: 15 },
        { header: 'Pacientes Atendidos', key: 'pacientes', width: 20 },
      ];
      const header2 = sheet.addRow({ seccion: 'Sección', medicamento: 'Medicamento', presentacion: 'Presentación', concentracion: 'Concentración', dosis: 'Dosis Totales', pacientes: 'Pacientes Atendidos' });
      header2.eachCell((cell) => { cell.style = headerStyle; });

      for (const m of metricaMed.medicamentosMasDispensados) {
        sheet.addRow({ seccion: 'Más Dispensados', medicamento: m.medicamento, presentacion: m.presentacion, concentracion: m.concentracion, dosis: m.totalDosis, pacientes: m.pacientes });
      }
    }

    if (metricaMed.medicamentosSinMovimientos.length > 0) {
      sheet.addRow({});
      sheet.columns = [
        { header: 'Sección', key: 'seccion', width: 20 },
        { header: 'Medicamento', key: 'medicamento', width: 40 },
      ];
      const header3 = sheet.addRow({ seccion: 'Sección', medicamento: 'Medicamento' });
      header3.eachCell((cell) => { cell.style = headerStyle; });

      for (const m of metricaMed.medicamentosSinMovimientos) {
        sheet.addRow({ seccion: 'Sin Movimientos', medicamento: m.nombre });
      }
    }
  }

  async generarExcelEstadisticas(data: EstadisticasMedicamentos, filename: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ApoPharma';

    const sheet = workbook.addWorksheet('Estadísticas');
    const headerStyle: Partial<ExcelJS.Style> = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } },
      font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
    };

    sheet.columns = [
      { header: 'Sección', key: 'seccion', width: 30 },
      { header: 'Métrica', key: 'metrica', width: 35 },
      { header: 'Valor', key: 'valor', width: 15 },
    ];
    sheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    const addRow = (seccion: string, metrica: string, valor: number | string) => {
      sheet.addRow({ seccion, metrica, valor: String(valor) });
    };

    addRow('General', 'Fecha', data.fechaActual ? new Date(data.fechaActual).toLocaleDateString() : '');
    addRow('General', 'Hora de cierre', data.horaCierre);
    addRow('General', 'Total pacientes', data.totalPacientes);
    addRow('General', 'Total medicamentos', data.totalMedicamentos);
    addRow('General', 'Total dispensaciones', data.totalDispensaciones);
    addRow('General', 'Total dosis', data.totalDosis);
    addRow('General', 'Promedio dosis/día', data.promedioDosisPorDia);
    sheet.addRow({});

    addRow('Distribución por Sexo y Edad', '', '');
    for (const item of data.distribucionSexoEdad) {
      addRow(
        item.sexo === 'M' ? 'Hombres' : 'Mujeres',
        `Edad ${item.rango}`,
        item.count,
      );
    }
    sheet.addRow({});

    if (data.medicamentosMasDispensados.length > 0) {
      sheet.columns = [
        { header: 'Sección', key: 'seccion', width: 20 },
        { header: 'Medicamento', key: 'medicamento', width: 30 },
        { header: 'Presentación', key: 'presentacion', width: 20 },
        { header: 'Concentración', key: 'concentracion', width: 15 },
        { header: 'Dosis Totales', key: 'dosis', width: 15 },
        { header: 'Pacientes', key: 'pacientes', width: 20 },
      ];
      const header2 = sheet.addRow({ seccion: 'Sección', medicamento: 'Medicamento', presentacion: 'Presentación', concentracion: 'Concentración', dosis: 'Dosis Totales', pacientes: 'Pacientes' });
      header2.eachCell((cell) => { cell.style = headerStyle; });

      for (const m of data.medicamentosMasDispensados) {
        sheet.addRow({ seccion: 'Top 10', medicamento: m.medicamento, presentacion: m.presentacion, concentracion: m.concentracion, dosis: m.totalDosis, pacientes: m.pacientes });
      }
    }

    if (data.medicamentosSinMovimientos.length > 0) {
      sheet.addRow({});
      sheet.columns = [
        { header: 'Sección', key: 'seccion', width: 20 },
        { header: 'Medicamento', key: 'medicamento', width: 40 },
      ];
      const header3 = sheet.addRow({ seccion: 'Sección', medicamento: 'Medicamento' });
      header3.eachCell((cell) => { cell.style = headerStyle; });

      for (const m of data.medicamentosSinMovimientos) {
        sheet.addRow({ seccion: 'Sin Uso', medicamento: m.nombre });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private agregarHojaPacientes(
    workbook: ExcelJS.Workbook,
    pacientes: ExportarCensoResponse['pacientes'],
  ): void {
    const sheet = workbook.addWorksheet('Pacientes');
    const headerStyle: Partial<ExcelJS.Style> = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } } };

    sheet.columns = [
      { header: 'Carpa', key: 'carpa', width: 14 },
      { header: 'Ubicación', key: 'ubicacion', width: 16 },
      { header: 'ID Emergencia', key: 'idEmergencia', width: 16 },
      { header: 'Nombre', key: 'nombre', width: 18 },
      { header: 'Apellido', key: 'apellido', width: 18 },
      { header: 'Cédula', key: 'cedula', width: 14 },
      { header: 'Teléfono', key: 'telefono', width: 14 },
      { header: 'Sexo', key: 'sexo', width: 8 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Peso', key: 'peso', width: 8 },
      { header: 'Situación Vivienda', key: 'situacionVivienda', width: 20 },
      { header: 'Discapacidad', key: 'discapacidad', width: 14 },
      { header: 'Relación', key: 'relacion', width: 14 },
      { header: 'Patologías', key: 'patologias', width: 30 },
      { header: 'Necesidades', key: 'necesidades', width: 30 },
    ];
    sheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    for (const p of pacientes) {
      sheet.addRow({
        carpa: p.carpa,
        ubicacion: p.ubicacion ?? '',
        idEmergencia: p.idEmergencia,
        nombre: p.nombre,
        apellido: p.apellido,
        cedula: p.cedula ?? '',
        telefono: p.telefono ?? '',
        sexo: p.sexo,
        edad: p.edadEstimada,
        peso: p.pesoEstimado,
        situacionVivienda: labelVivienda(p.situacionVivienda),
        discapacidad: p.tieneDiscapacidadMotora ? 'Sí' : 'No',
        relacion: p.relacion,
        patologias: p.patologias.map(x => x.nombre).join(', '),
        necesidades: p.necesidades.map(x => `${x.nombre}${x.suplida ? ' (S)' : ''}`).join(', '),
      });
    }
  }

  private agregarHojaDispensaciones(
    workbook: ExcelJS.Workbook,
    dispensaciones: ExportarCensoResponse['dispensaciones'],
  ): void {
    const sheet = workbook.addWorksheet('Dispensaciones');
    const headerStyle: Partial<ExcelJS.Style> = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } } };

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha/Hora', key: 'fecha', width: 20 },
      { header: 'ID Emergencia', key: 'idEmergencia', width: 16 },
      { header: 'Nombre', key: 'nombre', width: 18 },
      { header: 'Apellido', key: 'apellido', width: 18 },
      { header: 'Cédula', key: 'cedula', width: 14 },
      { header: 'Sexo', key: 'sexo', width: 8 },
      { header: 'Edad', key: 'edad', width: 8 },
      { header: 'Medicamento', key: 'medicamento', width: 25 },
      { header: 'Presentación', key: 'presentacion', width: 18 },
      { header: 'Concentración', key: 'concentracion', width: 14 },
      { header: 'Cantidad', key: 'cantidad', width: 10 },
      { header: 'Dosis (mg/kg)', key: 'dosis', width: 14 },
      { header: 'Despachado por', key: 'despachadoPor', width: 20 },
    ];
    sheet.getRow(1).eachCell((cell) => { cell.style = headerStyle; });

    for (const d of dispensaciones) {
      if (d.items.length === 0) {
        sheet.addRow({
          id: d.id,
          fecha: d.fechaHora,
          idEmergencia: d.idEmergencia,
          nombre: d.pacienteNombre,
          apellido: d.pacienteApellido,
          cedula: d.cedula ?? '',
          sexo: d.sexo,
          edad: d.edadEstimada,
          medicamento: '',
          presentacion: '',
          concentracion: '',
          cantidad: '',
          dosis: '',
          despachadoPor: d.despachadoPor,
        });
      } else {
        for (const item of d.items) {
          sheet.addRow({
            id: d.id,
            fecha: d.fechaHora,
            idEmergencia: d.idEmergencia,
            nombre: d.pacienteNombre,
            apellido: d.pacienteApellido,
            cedula: d.cedula ?? '',
            sexo: d.sexo,
            edad: d.edadEstimada,
            medicamento: item.medicamento,
            presentacion: item.presentacion,
            concentracion: item.concentracion,
            cantidad: item.cantidad,
            dosis: item.dosisMgKg,
            despachadoPor: d.despachadoPor,
          });
        }
      }
    }
  }
}
