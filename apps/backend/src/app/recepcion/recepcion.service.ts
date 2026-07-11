import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Medicamento } from '../common/entities/medicamento.entity';
import { CrearMedicamentoDto } from './dto/crear-medicamento.dto';
import { ActualizarMedicamentoDto } from './dto/actualizar-medicamento.dto';
import { Configuracion } from '../common/entities/configuracion.entity';

@Injectable()
export class RecepcionService {
  constructor(
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
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

  async createMedicamento(dto: CrearMedicamentoDto, usuarioId?: number) {
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
      createdById: usuarioId ?? null,
    });

    const saved = await this.medicamentoRepository.save(medicamento);

    const configuracion = this.configuracionRepository.create({
      medicamentoId: saved.id,
      umbralMinimo: 10,
      dosisMaximaMgKg: 0,
      pesoReferenciaKg: 70,
      createdById: usuarioId ?? null,
    });
    await this.configuracionRepository.save(configuracion);

    return saved;
  }

  async updateMedicamento(id: number, dto: ActualizarMedicamentoDto, usuarioId?: number) {
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

    medicamento.updatedById = usuarioId ?? null;
    return this.medicamentoRepository.save(medicamento);
  }

  async deleteMedicamento(id: number) {
    const medicamento = await this.medicamentoRepository.findOne({ where: { id } });
    if (!medicamento) {
      throw new NotFoundException('Medication not found');
    }
    medicamento.activo = false;
    await this.medicamentoRepository.save(medicamento);
    return { success: true };
  }

}
