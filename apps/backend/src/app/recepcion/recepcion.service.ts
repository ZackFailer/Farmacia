import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Lote } from '../common/entities/lote.entity';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { CrearLoteDto } from './dto/crear-lote.dto';
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

  async getMedicamentos(search?: string) {
    const qb = this.medicamentoRepository.createQueryBuilder('m');
    if (search?.trim()) {
      qb.where('LOWER(m.nombre_generico) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      }).orWhere('LOWER(m.nombre_comercial) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }
    qb.orderBy('m.nombre_generico', 'ASC');
    return qb.getMany();
  }

  async createMedicamento(dto: CrearMedicamentoDto) {
    const medicamento = this.medicamentoRepository.create({
      nombreGenerico: dto.nombreGenerico,
      nombreComercial: dto.nombreComercial ?? null,
      presentacion: dto.presentacion,
      concentracion: dto.concentracion,
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

  async getLotes(page = 1, limit = 20) {
    return this.loteRepository.find({
      relations: { medicamento: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async createLote(dto: CrearLoteDto) {
    const medicamento = await this.medicamentoRepository.findOne({
      where: { id: dto.medicamentoId },
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

  async getLoteById(id: number) {
    const lote = await this.loteRepository.findOne({
      where: { id },
      relations: { medicamento: true },
    });
    if (!lote) {
      throw new NotFoundException('Lot not found');
    }
    return lote;
  }

  async getLoteQr(id: number) {
    const lote = await this.getLoteById(id);
    return { loteId: lote.id, codigoQr: lote.codigoQr };
  }
}
