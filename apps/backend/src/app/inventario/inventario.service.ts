import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { Medicamento } from '../common/entities/medicamento.entity';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getInventario(search?: string) {
    const qb = this.medicamentoRepository
      .createQueryBuilder('m')
      .leftJoin(Configuracion, 'c', 'c.medicamento_id = m.id')
      .where('m.activo = :activo', { activo: true })
      .select('m.id', 'medicamentoId')
      .addSelect('m.nombre_generico', 'nombreGenerico')
      .addSelect('m.nombre_comercial', 'nombreComercial')
      .addSelect('m.presentacion', 'presentacion')
      .addSelect('m.concentracion', 'concentracion')
      .addSelect('m.unidad_concentracion', 'unidadConcentracion')
      .addSelect('COALESCE(c.umbral_minimo, 10)', 'umbralMinimo')
      .orderBy('m.nombre_generico', 'ASC');

    if (search?.trim()) {
      qb.andWhere('LOWER(m.nombre_generico) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return qb.getRawMany();
  }

  async getUmbrales() {
    const medicamentos = await this.medicamentoRepository.find({
      where: { activo: true },
      relations: { configuracion: true },
      order: { nombreGenerico: 'ASC' },
    });
    return medicamentos.map(m => ({
      id: m.configuracion?.id ?? 0,
      medicamentoId: m.id,
      medicamento: {
        id: m.id,
        nombreGenerico: m.nombreGenerico,
        nombreComercial: m.nombreComercial,
        presentacion: m.presentacion,
        concentracion: m.concentracion,
        unidadConcentracion: m.unidadConcentracion,
        activo: m.activo,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      },
      umbralMinimo: m.configuracion?.umbralMinimo ?? 10,
      dosisMaximaMgKg: m.configuracion?.dosisMaximaMgKg ?? null,
      pesoReferenciaKg: m.configuracion?.pesoReferenciaKg ?? null,
      activo: true,
      updatedAt: m.configuracion?.updatedAt ?? m.updatedAt,
    }));
  }

  async actualizarUmbral(medicamentoId: number, umbralMinimo: number, usuarioId?: number) {
    let conf = await this.configuracionRepository.findOne({
      where: { medicamentoId, activo: true },
    });
    if (!conf) {
      const medicamento = await this.medicamentoRepository.findOne({
        where: { id: medicamentoId, activo: true },
      });
      if (!medicamento) throw new NotFoundException('Medicamento no encontrado');
      conf = this.configuracionRepository.create({
        medicamentoId,
        umbralMinimo,
        createdById: usuarioId ?? null,
      });
    } else {
      conf.umbralMinimo = umbralMinimo;
      conf.updatedById = usuarioId ?? null;
    }
    return this.configuracionRepository.save(conf);
  }

  async getMetricas() {
    const manager = this.dataSource.manager;

    const totalPacientes = await manager
      .createQueryBuilder(Dispensacion, 'd')
      .select('COUNT(DISTINCT d.paciente_id)', 'count')
      .where('d.activo = :activo', { activo: true })
      .getRawOne<{ count: number }>();

    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);
    const semanaStr = semanaAtras.toISOString().slice(0, 10);

    const pacientesHoy = await manager
      .createQueryBuilder(Dispensacion, 'd')
      .select('COUNT(DISTINCT d.paciente_id)', 'count')
      .where("date(d.fecha_hora) = :hoy", { hoy: hoyStr })
      .andWhere('d.activo = :activo', { activo: true })
      .getRawOne<{ count: number }>();

    const pacientesSemana = await manager
      .createQueryBuilder(Dispensacion, 'd')
      .select('COUNT(DISTINCT d.paciente_id)', 'count')
      .where("date(d.fecha_hora) >= :semana", { semana: semanaStr })
      .andWhere('d.activo = :activo', { activo: true })
      .getRawOne<{ count: number }>();

    const dosisTotales = await manager
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .select('COALESCE(SUM(dd.cantidad), 0)', 'total')
      .where('dd.activo = :activo', { activo: true })
      .getRawOne<{ total: number }>();

    const primeraDispensacion = await manager
      .createQueryBuilder(Dispensacion, 'd')
      .select('MIN(d.fecha_hora)', 'minFecha')
      .where('d.activo = :activo', { activo: true })
      .getRawOne<{ minFecha: string }>();

    let promedioDosisPorDia = 0;
    if (primeraDispensacion?.minFecha) {
      const inicio = new Date(primeraDispensacion.minFecha);
      const diasTranscurridos = Math.max(1, Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
      promedioDosisPorDia = Math.round((dosisTotales?.total ?? 0) / diasTranscurridos);
    }

    const egresosPorDia = await manager
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .innerJoin(Dispensacion, 'd', 'd.id = dd.dispensacion_id')
      .select("date(d.fecha_hora)", 'fecha')
      .addSelect('SUM(dd.cantidad)', 'total')
      .where("date(d.fecha_hora) >= :semana", { semana: semanaStr })
      .andWhere('dd.activo = :activo', { activo: true })
      .andWhere('d.activo = :activo', { activo: true })
      .groupBy("date(d.fecha_hora)")
      .orderBy("date(d.fecha_hora)", 'ASC')
      .getRawMany<{ fecha: string; total: number }>();

    const medicamentosMasDispensados = await manager
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .innerJoin(Medicamento, 'm', 'm.id = dd.medicamento_id')
      .select('dd.medicamento_id', 'medicamentoId')
      .addSelect('m.nombre_generico', 'medicamento')
      .addSelect('SUM(dd.cantidad)', 'totalDosis')
      .addSelect('COUNT(DISTINCT d.paciente_id)', 'pacientes')
      .innerJoin(Dispensacion, 'd', 'd.id = dd.dispensacion_id')
      .where('dd.activo = :activo', { activo: true })
      .andWhere('d.activo = :activo', { activo: true })
      .groupBy('dd.medicamento_id')
      .orderBy('SUM(dd.cantidad)', 'DESC')
      .limit(10)
      .getRawMany();

    const medicamentosConMovimiento = await manager
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .select('DISTINCT dd.medicamento_id', 'id')
      .where('dd.activo = :activo', { activo: true })
      .getRawMany<{ id: number }>();

    const idsConMovimiento = medicamentosConMovimiento.map(r => r.id);

    const medicamentosSinMovimientos = await manager
      .createQueryBuilder(Medicamento, 'm')
      .select('m.id', 'id')
      .addSelect('m.nombre_generico', 'nombre')
      .where('m.activo = :activo', { activo: true })
      .getRawMany<{ id: number; nombre: string }>();

    const sinMovimientos = medicamentosSinMovimientos
      .filter(m => !idsConMovimiento.includes(m.id))
      .map(m => ({ id: m.id, nombre: m.nombre }));

    const totalMedicamentos = await manager
      .createQueryBuilder(Medicamento, 'm')
      .where('m.activo = :activo', { activo: true })
      .getCount();

    return {
      pacientesAtendidosTotal: totalPacientes?.count ?? 0,
      pacientesAtendidosHoy: pacientesHoy?.count ?? 0,
      pacientesAtendidosSemana: pacientesSemana?.count ?? 0,
      dosisTotales: dosisTotales?.total ?? 0,
      promedioDosisPorDia,
      egresosPorDia: egresosPorDia.map(e => ({ fecha: e.fecha, total: Number(e.total) })),
      medicamentosMasDispensados: medicamentosMasDispensados.map(m => ({
        medicamento: m.medicamento,
        medicamentoId: Number(m.medicamentoId),
        totalDosis: Number(m.totalDosis),
        pacientes: Number(m.pacientes),
      })),
      medicamentosSinMovimientos: sinMovimientos,
      totalMedicamentos,
    };
  }
}
