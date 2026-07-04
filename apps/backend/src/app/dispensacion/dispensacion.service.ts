import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { Lote } from '../common/entities/lote.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { CrearPacienteDto } from './dto/crear-paciente.dto';
import { CrearDispensacionDto } from './dto/crear-dispensacion.dto';
import { MovementType } from '../common/enums/movement-type.enum';
import { LoteMovimiento } from '../common/entities/lote-movimiento.entity';
import { Medicamento } from '../common/entities/medicamento.entity';

@Injectable()
export class DispensacionService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
    @InjectRepository(Dispensacion)
    private readonly dispensacionRepository: Repository<Dispensacion>,
    @InjectRepository(DispensacionDetalle)
    private readonly detalleRepository: Repository<DispensacionDetalle>,
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  createPaciente(dto: CrearPacienteDto) {
    const paciente = this.pacienteRepository.create(dto);
    return this.pacienteRepository.save(paciente);
  }

  async getPacienteByIdEmergencia(idEmergencia: string) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idEmergencia },
    });

    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }

    return paciente;
  }

  getLotesDisponibles(medicamentoId: number) {
    return this.loteRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.medicamento', 'm')
      .where('l.medicamento_id = :medicamentoId', { medicamentoId })
      .andWhere('l.cantidad_actual > 0')
      .orderBy('l.fecha_vencimiento', 'ASC')
      .addOrderBy('l.id', 'ASC')
      .getMany();
  }

  async getDoseConfig(medicamentoId: number) {
    const config = await this.configuracionRepository.findOne({
      where: { medicamentoId },
      relations: { medicamento: true },
    });
    if (!config) {
      throw new NotFoundException('Dose configuration not found');
    }
    return config;
  }

  async crearDispensacion(dto: CrearDispensacionDto, usuarioId: number) {
    return this.dataSource.transaction(async (manager) => {
      const paciente = await manager.findOne(Paciente, {
        where: { id: dto.pacienteId },
      });
      if (!paciente) {
        throw new NotFoundException('Patient not found');
      }

      const dispensacion = manager.create(Dispensacion, {
        pacienteId: paciente.id,
        usuarioId,
        fechaHora: new Date(),
        observaciones: dto.observaciones ?? null,
      });
      const savedDispensacion = await manager.save(Dispensacion, dispensacion);

      for (const item of dto.detalles) {
        const firstAvailable = await manager
          .createQueryBuilder(Lote, 'l')
          .where('l.medicamento_id = :medicamentoId', {
            medicamentoId: item.medicamentoId,
          })
          .andWhere('l.cantidad_actual > 0')
          .orderBy('l.fecha_vencimiento', 'ASC')
          .addOrderBy('l.id', 'ASC')
          .getOne();

        if (firstAvailable && firstAvailable.id !== item.loteId) {
          throw new BadRequestException(
            `Dispensation must follow FEFO. Next lot is ${firstAvailable.id}`,
          );
        }

        const lote = await manager.findOne(Lote, {
          where: { id: item.loteId },
          relations: { medicamento: true },
        });
        if (!lote) {
          throw new NotFoundException(`Lot ${item.loteId} not found`);
        }

        if (lote.medicamentoId !== item.medicamentoId) {
          throw new BadRequestException(
            `Lot ${item.loteId} does not belong to medication ${item.medicamentoId}`,
          );
        }

        if (lote.cantidadActual < item.cantidad) {
          throw new BadRequestException(
            `Insufficient stock for lot ${item.loteId}`,
          );
        }

        const config = await manager.findOne(Configuracion, {
          where: { medicamentoId: item.medicamentoId },
        });

        const peso = paciente.pesoEstimado || (config?.pesoReferenciaKg ?? 70);
        const dosisMgKg = (item.cantidad * lote.medicamento.concentracion) / peso;

        if (
          config &&
          config.dosisMaximaMgKg > 0 &&
          dosisMgKg > config.dosisMaximaMgKg
        ) {
          throw new BadRequestException(
            `Dose exceeds maximum for medication ${item.medicamentoId}`,
          );
        }

        const detalle = manager.create(DispensacionDetalle, {
          dispensacionId: savedDispensacion.id,
          loteId: lote.id,
          medicamentoId: item.medicamentoId,
          cantidad: item.cantidad,
          dosisMgKg,
        });
        await manager.save(DispensacionDetalle, detalle);

        lote.cantidadActual -= item.cantidad;
        await manager.save(Lote, lote);

        const movement = manager.create(LoteMovimiento, {
          loteId: lote.id,
          tipo: MovementType.DISPENSATION,
          cantidad: -item.cantidad,
          motivo: `Dispensation #${savedDispensacion.id}`,
          usuarioId,
        });
        await manager.save(LoteMovimiento, movement);
      }

      return manager.findOne(Dispensacion, {
        where: { id: savedDispensacion.id },
        relations: {
          paciente: true,
          usuario: true,
          detalles: { lote: true, medicamento: true },
        },
      });
    });
  }
}
