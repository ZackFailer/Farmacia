import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from '../common/entities/lote.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';
import { Medicamento } from '../common/entities/medicamento.entity';
import { MovementType } from '../common/enums/movement-type.enum';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
    @InjectRepository(LoteMovimiento)
    private readonly movimientoRepository: Repository<LoteMovimiento>,
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
  ) {}

  async getInventario(search?: string) {
    const qb = this.loteRepository
      .createQueryBuilder('l')
      .innerJoin('l.medicamento', 'm')
      .leftJoin(Configuracion, 'c', 'c.medicamento_id = m.id')
      .where('l.activo = :activo', { activo: true })
      .andWhere('m.activo = :activo', { activo: true })
      .select('m.id', 'medicamentoId')
      .addSelect('m.nombre_generico', 'nombreGenerico')
      .addSelect('m.nombre_comercial', 'nombreComercial')
      .addSelect('m.presentacion', 'presentacion')
      .addSelect('m.concentracion', 'concentracion')
      .addSelect('COALESCE(c.umbral_minimo, 10)', 'umbralMinimo')
      .addSelect('SUM(l.cantidad_actual)', 'stockTotal')
      .addSelect('MIN(l.fecha_vencimiento)', 'proximoVencimiento')
      .groupBy('m.id')
      .addGroupBy('c.umbral_minimo')
      .orderBy('m.nombre_generico', 'ASC');

    if (search?.trim()) {
      qb.where('LOWER(m.nombre_generico) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    return qb.getRawMany();
  }

  async getProximosVencer(days = 90) {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    return this.loteRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.medicamento', 'm')
      .where('l.activo = :activo', { activo: true })
      .andWhere('l.cantidad_actual > 0')
      .andWhere('l.fecha_vencimiento BETWEEN :now AND :end', {
        now: now.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      })
      .orderBy('l.fecha_vencimiento', 'ASC')
      .getMany();
  }

  async ajustarStock(
    loteId: number,
    cantidadReal: number,
    usuarioId?: number,
    motivo?: string,
  ) {
    const lote = await this.loteRepository.findOne({ where: { id: loteId, activo: true } });
    if (!lote) {
      throw new NotFoundException('Lot not found');
    }

    const diferencia = cantidadReal - lote.cantidadActual;
    lote.cantidadActual = cantidadReal;
    await this.loteRepository.save(lote);

    await this.movimientoRepository.save(
      this.movimientoRepository.create({
        loteId: lote.id,
        tipo: MovementType.ADJUSTMENT,
        cantidad: diferencia,
        motivo: motivo ?? 'Physical count adjustment',
        usuarioId: usuarioId ?? null,
      }),
    );

    return this.loteRepository.findOne({
      where: { id: lote.id },
      relations: { medicamento: true },
    });
  }

  async getMovimientosLote(loteId: number) {
    return this.movimientoRepository.find({
      where: { loteId, activo: true },
      order: { createdAt: 'DESC' },
    });
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

  async actualizarUmbral(medicamentoId: number, umbralMinimo: number) {
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
      });
    } else {
      conf.umbralMinimo = umbralMinimo;
    }
    return this.configuracionRepository.save(conf);
  }
}
