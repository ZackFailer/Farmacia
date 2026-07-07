import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Lote } from '../common/entities/lote.entity';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { ActualizarMedicamentoDto } from './dto/actualizar-medicamento.dto';
import { CrearLoteDto } from './dto/crear-lote.dto';
import { ActualizarLoteDto } from './dto/actualizar-lote.dto';
import { Configuracion } from '../common/entities/configuracion.entity';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';
import { MovementType } from '../common/enums/movement-type.enum';

@Injectable()
export class RecepcionService {
  constructor(
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
    @InjectRepository(LoteMovimiento)
    private readonly movimientoRepository: Repository<LoteMovimiento>,
  ) {}

  async getMedicamentos(search?: string, incluirInactivos?: boolean) {
    const qb = this.medicamentoRepository.createQueryBuilder('m');
    if (!incluirInactivos) {
      qb.where('m.activo = :activo', { activo: true });
    }
    if (search?.trim()) {
      qb.andWhere(new Brackets((subQb) => {
        subQb
          .where('LOWER(m.nombre_generico) LIKE :search', {
            search: `%${search.toLowerCase()}%`,
          })
          .orWhere('LOWER(m.nombre_comercial) LIKE :search', {
            search: `%${search.toLowerCase()}%`,
          });
      }));
    }
    qb.orderBy('m.nombre_generico', 'ASC');
    return qb.getMany();
  }

  async createMedicamento(dto: CrearMedicamentoDto) {
    const existing = await this.medicamentoRepository.findOne({
      where: {
        nombreGenerico: dto.nombreGenerico,
        presentacion: dto.presentacion,
        concentracion: dto.concentracion,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un medicamento "${dto.nombreGenerico}" con presentación "${dto.presentacion}" y concentración ${dto.concentracion}.`
      );
    }

    const medicamento = this.medicamentoRepository.create({
      nombreGenerico: dto.nombreGenerico,
      nombreComercial: dto.nombreComercial ?? null,
      presentacion: dto.presentacion,
      concentracion: dto.concentracion,
      unidadConcentracion: dto.unidadConcentracion ?? 'mg',
      esVital: dto.esVital ?? false,
    });

    const saved = await this.medicamentoRepository.save(medicamento);

    const configuracion = this.configuracionRepository.create({
      medicamentoId: saved.id,
      umbralMinimo: 10,
      dosisMaximaMgKg: 0,
      pesoReferenciaKg: 70,
    });
    await this.configuracionRepository.save(configuracion);

    return saved;
  }

  async updateMedicamento(id: number, dto: ActualizarMedicamentoDto) {
    const medicamento = await this.medicamentoRepository.findOne({ where: { id } });
    if (!medicamento) {
      throw new NotFoundException('Medication not found');
    }

    if (dto.nombreGenerico !== undefined) medicamento.nombreGenerico = dto.nombreGenerico;
    if (dto.nombreComercial !== undefined) medicamento.nombreComercial = dto.nombreComercial;
    if (dto.presentacion !== undefined) medicamento.presentacion = dto.presentacion;
    if (dto.concentracion !== undefined) medicamento.concentracion = dto.concentracion;
    if (dto.unidadConcentracion !== undefined) medicamento.unidadConcentracion = dto.unidadConcentracion;
    if (dto.esVital !== undefined) medicamento.esVital = dto.esVital;
    if (dto.activo !== undefined) medicamento.activo = dto.activo;

    return this.medicamentoRepository.save(medicamento);
  }

  async deleteMedicamento(id: number) {
    const medicamento = await this.medicamentoRepository.findOne({ where: { id } });
    if (!medicamento) {
      throw new NotFoundException('Medication not found');
    }
    await this.medicamentoRepository.remove(medicamento);
    return { success: true };
  }

  async getLotes(page = 1, limit = 20, incluirInactivos?: boolean) {
    const where = incluirInactivos ? {} : { activo: true };
    return this.loteRepository.find({
      where,
      relations: { medicamento: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async createLote(dto: CrearLoteDto) {
    const medicamento = await this.medicamentoRepository.findOne({
      where: { id: dto.medicamentoId, activo: true },
    });

    if (!medicamento) {
      throw new NotFoundException('Medication not found');
    }

    const lote = this.loteRepository.create({
      medicamentoId: medicamento.id,
      codigoQr: uuidv4(),
      cantidadInicial: dto.cantidadInicial,
      cantidadActual: dto.cantidadInicial,
      fechaVencimiento: dto.fechaVencimiento,
      donante: dto.donante ?? null,
      ubicacion: dto.ubicacion ?? null,
    });

    const savedLote = await this.loteRepository.save(lote);

    await this.movimientoRepository.save(
      this.movimientoRepository.create({
        loteId: savedLote.id,
        tipo: MovementType.INBOUND,
        cantidad: dto.cantidadInicial,
        motivo: 'New lot reception',
        usuarioId: null,
      }),
    );

    return this.loteRepository.findOne({
      where: { id: savedLote.id },
      relations: { medicamento: true },
    });
  }

  async updateLote(id: number, dto: ActualizarLoteDto) {
    const lote = await this.loteRepository.findOne({ where: { id } });
    if (!lote) {
      throw new NotFoundException('Lot not found');
    }

    if (dto.fechaVencimiento !== undefined) lote.fechaVencimiento = dto.fechaVencimiento;
    if (dto.donante !== undefined) lote.donante = dto.donante;
    if (dto.ubicacion !== undefined) lote.ubicacion = dto.ubicacion;

    return this.loteRepository.save(lote);
  }

  async deleteLote(id: number) {
    const lote = await this.loteRepository.findOne({ where: { id } });
    if (!lote) {
      throw new NotFoundException('Lot not found');
    }
    await this.loteRepository.remove(lote);
    return { success: true };
  }

  async getLoteById(id: number) {
    const lote = await this.loteRepository.findOne({
      where: { id, activo: true },
      relations: { medicamento: true },
    });
    if (!lote) {
      throw new NotFoundException('Lot not found');
    }
    return lote;
  }

  async getLoteByQR(codigoQr: string) {
    const lote = await this.loteRepository.findOne({
      where: { codigoQr, activo: true },
      relations: { medicamento: true },
    });
    if (!lote) {
      throw new NotFoundException('Lote no encontrado');
    }
    return lote;
  }

  async getLoteQr(id: number) {
    const lote = await this.getLoteById(id);
    return { loteId: lote.id, codigoQr: lote.codigoQr };
  }
}
