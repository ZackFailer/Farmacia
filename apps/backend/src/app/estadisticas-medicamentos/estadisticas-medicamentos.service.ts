import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { ParametroSistema } from '../common/entities/parametro-sistema.entity';
import type { EstadisticasMedicamentosResponse } from './dto/estadisticas-medicamentos.dto';

@Injectable()
export class EstadisticasMedicamentosService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectRepository(Dispensacion)
    private readonly dispensacionRepository: Repository<Dispensacion>,
    @InjectRepository(DispensacionDetalle)
    private readonly detalleRepository: Repository<DispensacionDetalle>,
    @InjectRepository(ParametroSistema)
    private readonly parametroRepository: Repository<ParametroSistema>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getEstadisticas(): Promise<EstadisticasMedicamentosResponse> {
    const pacientes = await this.pacienteRepository.find({ where: { activo: true } });
    const totalPacientes = pacientes.length;

    const totalMedicamentos = await this.medicamentoRepository.count({ where: { activo: true } });

    const totalDispensaciones = await this.dispensacionRepository.count({ where: { activo: true } });

    const dosisTotales = await this.dataSource
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .select('COALESCE(SUM(dd.cantidad), 0)', 'total')
      .where('dd.activo = :activo', { activo: true })
      .getRawOne<{ total: number }>();

    const primeraDispensacion = await this.dataSource
      .createQueryBuilder(Dispensacion, 'd')
      .select('MIN(d.fecha_hora)', 'minFecha')
      .where('d.activo = :activo', { activo: true })
      .getRawOne<{ minFecha: string }>();

    const hoy = new Date();
    let promedioDosisPorDia = 0;
    if (primeraDispensacion?.minFecha) {
      const inicio = new Date(primeraDispensacion.minFecha);
      const dias = Math.max(1, Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
      promedioDosisPorDia = Math.round((dosisTotales?.total ?? 0) / dias);
    }

    const medicamentosMasDispensados = await this.dataSource
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .innerJoin(Medicamento, 'm', 'm.id = dd.medicamento_id')
      .select('dd.medicamento_id', 'medicamentoId')
      .addSelect('m.nombre_generico', 'medicamento')
      .addSelect('m.presentacion', 'presentacion')
      .addSelect("CONCAT(m.concentracion, ' ', m.unidad_concentracion)", 'concentracion')
      .addSelect('SUM(dd.cantidad)', 'totalDosis')
      .addSelect('COUNT(DISTINCT d.paciente_id)', 'pacientes')
      .innerJoin(Dispensacion, 'd', 'd.id = dd.dispensacion_id')
      .where('dd.activo = :activo', { activo: true })
      .andWhere('d.activo = :activo', { activo: true })
      .groupBy('dd.medicamento_id')
      .addGroupBy('m.nombre_generico')
      .addGroupBy('m.presentacion')
      .addGroupBy('m.concentracion')
      .addGroupBy('m.unidad_concentracion')
      .orderBy('SUM(dd.cantidad)', 'DESC')
      .limit(10)
      .getRawMany();

    const medicamentosConMovimiento = await this.dataSource
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .select('DISTINCT dd.medicamento_id', 'id')
      .where('dd.activo = :activo', { activo: true })
      .getRawMany<{ id: number }>();

    const idsConMovimiento = medicamentosConMovimiento.map(r => r.id);

    const todosMedicamentos = await this.dataSource
      .createQueryBuilder(Medicamento, 'm')
      .select('m.id', 'id')
      .addSelect('m.nombre_generico', 'nombre')
      .where('m.activo = :activo', { activo: true })
      .getRawMany<{ id: number; nombre: string }>();

    const medicamentosSinMovimientos = todosMedicamentos
      .filter(m => !idsConMovimiento.includes(m.id))
      .map(m => ({ id: m.id, nombre: m.nombre }));

    // Distribution by sex and age
    const distribucionSexoEdad: { sexo: string; rango: string; count: number }[] = [];
    const calcularEdad = (p: Paciente): number => {
      if (p.esRecienNacido) return 0;
      if (p.fechaNacimiento) {
        const nacimiento = new Date(p.fechaNacimiento);
        const hoyDate = new Date();
        let edad = hoyDate.getFullYear() - nacimiento.getFullYear();
        const mesDiff = hoyDate.getMonth() - nacimiento.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoyDate.getDate() < nacimiento.getDate())) {
          edad--;
        }
        return Math.max(0, edad);
      }
      return p.edadManual ?? 0;
    };
    const rangos = [
      { label: '0-5', min: 0, max: 5 },
      { label: '6-10', min: 6, max: 10 },
      { label: '11-15', min: 11, max: 15 },
      { label: '16-59', min: 16, max: 59 },
      { label: '60+', min: 60, max: Infinity },
    ];
    for (const sexo of ['M', 'F']) {
      for (const rango of rangos) {
        const count = pacientes.filter(
          p => p.sexo === sexo && (() => {
            const edad = calcularEdad(p);
            return edad >= rango.min && edad <= rango.max;
          })(),
        ).length;
        if (count > 0) {
          distribucionSexoEdad.push({ sexo, rango: rango.label, count });
        }
      }
    }

    // horaCierre from system params
    let horaCierre = '18:00';
    const param = await this.parametroRepository.findOne({ where: { clave: 'hora_cierre' } });
    if (param) {
      horaCierre = param.valor;
    }

    return {
      totalPacientes,
      totalMedicamentos,
      totalDispensaciones,
      totalDosis: dosisTotales?.total ?? 0,
      promedioDosisPorDia,
      fechaActual: hoy.toISOString(),
      horaCierre,
      distribucionSexoEdad,
      medicamentosMasDispensados: medicamentosMasDispensados.map(m => ({
        medicamento: m.medicamento,
        medicamentoId: Number(m.medicamentoId),
        presentacion: m.presentacion ?? '',
        concentracion: m.concentracion ?? '',
        totalDosis: Number(m.totalDosis),
        pacientes: Number(m.pacientes),
      })),
      medicamentosSinMovimientos,
    };
  }
}
