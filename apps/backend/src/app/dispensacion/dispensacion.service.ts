import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
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

  private async generateNextEmergenciaId(): Promise<string> {
    const year = new Date().getFullYear();
    const lastPaciente = await this.pacienteRepository
      .createQueryBuilder('p')
      .where('p.activo = :activo', { activo: true })
      .andWhere('p.idEmergencia LIKE :pattern', { pattern: `EM-${year}-%` })
      .orderBy('p.id', 'DESC')
      .getOne();
    let nextSeq = 1;
    if (lastPaciente) {
      const parts = lastPaciente.idEmergencia.split('-');
      nextSeq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `EM-${year}-${String(nextSeq).padStart(3, '0')}`;
  }

  private async loadPacienteConNucleo(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, activo: true },
      relations: { familiares: { nucleo: { miembros: { paciente: true }, titular: true } } },
    });
    if (!paciente) return null;
    return paciente;
  }

  async createPaciente(dto: CrearPacienteDto) {
    const idEmergencia = dto.idEmergencia ?? (await this.generateNextEmergenciaId());
    const { familiares, ...pacienteData } = dto;
    const paciente = this.pacienteRepository.create({ ...pacienteData, idEmergencia });
    const saved = await this.pacienteRepository.save(paciente);

    if (familiares?.length) {
      const nucleo = this.dataSource.manager.create(NucleoFamiliar, {
        titular: { id: saved.id } as Paciente,
      });
      const savedNucleo = await this.dataSource.manager.save(NucleoFamiliar, nucleo);

      const titularMember = this.dataSource.manager.create(NucleoFamiliarMiembro, {
        nucleoId: savedNucleo.id,
        pacienteId: saved.id,
        relacion: 'Titular',
      });
      await this.dataSource.manager.save(NucleoFamiliarMiembro, titularMember);

      for (const f of familiares) {
        const familiarIdEmergencia = await this.generateNextEmergenciaId();
        const familiarPaciente = this.pacienteRepository.create({
          nombre: f.nombre,
          apellido: f.apellido ?? '',
          cedula: f.cedula ?? null,
          sexo: f.sexo,
          edadEstimada: f.edadEstimada,
          pesoEstimado: f.pesoEstimado,
          esDamnificado: f.esDamnificado,
          idEmergencia: familiarIdEmergencia,
        });
        const savedFamiliar = await this.pacienteRepository.save(familiarPaciente);

        const member = this.dataSource.manager.create(NucleoFamiliarMiembro, {
          nucleoId: savedNucleo.id,
          pacienteId: savedFamiliar.id,
          relacion: f.relacion,
        });
        await this.dataSource.manager.save(NucleoFamiliarMiembro, member);
      }
    }

    return this.loadPacienteConNucleo(saved.id);
  }

  async getPacienteByIdEmergencia(idEmergencia: string) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idEmergencia, activo: true },
      relations: { familiares: { nucleo: { miembros: { paciente: true }, titular: true } } },
    });

    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }

    return paciente;
  }

  async getFamiliares(pacienteId: number) {
    const memberEntry = await this.dataSource.manager.findOne(NucleoFamiliarMiembro, {
      where: { pacienteId, activo: true },
    });
    if (!memberEntry) return [];

    const allMembers = await this.dataSource.manager.find(NucleoFamiliarMiembro, {
      where: { nucleoId: memberEntry.nucleoId, activo: true },
      relations: { paciente: true },
    });

    return allMembers
      .filter((m) => m.pacienteId !== pacienteId)
      .map((m) => ({
        ...m.paciente,
        relacion: m.relacion,
      }));
  }

  async searchPacientes(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.pacienteRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.familiares', 'nfm')
      .leftJoinAndSelect('nfm.nucleo', 'nf')
      .leftJoinAndSelect('nf.miembros', 'all_members')
      .leftJoinAndSelect('all_members.paciente', 'member_paciente')
      .leftJoinAndSelect('nf.titular', 'titular')
      .where('p.activo = :activo', { activo: true })
      .andWhere('LOWER(p.idEmergencia) LIKE :q', { q: `%${q}%` })
      .orWhere('LOWER(p.nombre) LIKE :q', { q: `%${q}%` })
      .orWhere('LOWER(p.apellido) LIKE :q', { q: `%${q}%` })
      .orWhere('p.cedula LIKE :q', { q: `%${q}%` })
      .take(20)
      .getMany();
  }

  getLotesDisponibles(medicamentoId: number) {
    return this.loteRepository
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.medicamento', 'm')
      .where('l.activo = :activo', { activo: true })
      .andWhere('l.medicamento_id = :medicamentoId', { medicamentoId })
      .andWhere('l.cantidad_actual > 0')
      .orderBy('l.fecha_vencimiento', 'ASC')
      .addOrderBy('l.id', 'ASC')
      .getMany();
  }

  async getDoseConfig(medicamentoId: number) {
    const config = await this.configuracionRepository.findOne({
      where: { medicamentoId, activo: true },
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
        where: { id: dto.pacienteId, activo: true },
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
          .where('l.activo = :activo', { activo: true })
          .andWhere('l.medicamento_id = :medicamentoId', {
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
          where: { id: item.loteId, activo: true },
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
          where: { medicamentoId: item.medicamentoId, activo: true },
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
