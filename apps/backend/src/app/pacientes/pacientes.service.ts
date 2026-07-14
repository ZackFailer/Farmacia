import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryFailedError, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { PacientePatologia } from '../common/entities/paciente-patologia.entity';
import { PacienteNecesidad } from '../common/entities/paciente-necesidad.entity';
import { CatalogoPatologia } from '../common/entities/patologia.entity';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';
import { CrearPacienteDto } from './dto/crear-paciente.dto';
import { ActualizarPacienteDto } from './dto/actualizar-paciente.dto';
import { AgregarFamiliarDto } from './dto/agregar-familiar.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(NucleoFamiliar)
    private readonly nucleoRepository: Repository<NucleoFamiliar>,
    @InjectRepository(NucleoFamiliarMiembro)
    private readonly miembroRepository: Repository<NucleoFamiliarMiembro>,
    @InjectRepository(PacientePatologia)
    private readonly pacientePatologiaRepository: Repository<PacientePatologia>,
    @InjectRepository(PacienteNecesidad)
    private readonly pacienteNecesidadRepository: Repository<PacienteNecesidad>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createPaciente(dto: CrearPacienteDto, usuarioId?: number) {
    const { familiares, patologiaIds, patologias, necesidadIds, ...pacienteData } = dto;
    let savedId = 0;

    await this.dataSource.transaction(async (manager) => {
      const pacienteRepository = manager.getRepository(Paciente);
      const patologiaRepository = manager.getRepository(PacientePatologia);
      const necesidadRepository = manager.getRepository(PacienteNecesidad);
      const nucleoRepository = manager.getRepository(NucleoFamiliar);
      const miembroRepository = manager.getRepository(NucleoFamiliarMiembro);

      const saved = await this.savePacienteWithUniqueId(
        pacienteRepository,
        {
          ...pacienteData,
          telefono: pacienteData.telefono ?? null,
          edadEstimada: this.computeEdadEstimada(pacienteData),
          createdById: usuarioId ?? null,
        },
        dto.idEmergencia,
        manager,
      );
      savedId = saved.id;

      await this.savePacienteRelations(patologiaRepository, necesidadRepository, saved.id, patologias, patologiaIds, necesidadIds);

      if (!familiares?.length) {
        return;
      }

      const nucleo = nucleoRepository.create({
        titular: { id: saved.id } as Paciente,
      });
      const savedNucleo = await nucleoRepository.save(nucleo);

      const titularMember = miembroRepository.create({
        nucleoId: savedNucleo.id,
        pacienteId: saved.id,
        relacion: 'Titular',
      });
      await miembroRepository.save(titularMember);

      for (const f of familiares) {
        const { patologiaIds: fPatologiaIds, patologias: fPatologias, necesidadIds: fNecesidadIds } = f;
        const savedFamiliar = await this.savePacienteWithUniqueId(pacienteRepository, {
          nombre: f.nombre,
          apellido: f.apellido ?? '',
          cedula: f.cedula ?? null,
          telefono: f.telefono ?? null,
          sexo: f.sexo,
          edadEstimada: this.computeEdadEstimada(f),
          fechaNacimiento: f.fechaNacimiento ?? null,
          edadManual: f.edadManual ?? null,
          esRecienNacido: f.esRecienNacido ?? false,
          pesoEstimado: f.pesoEstimado,
          situacionVivienda: f.situacionVivienda,
          tieneCargaFamiliar: false,
          tieneDiscapacidadMotora: f.tieneDiscapacidadMotora ?? false,
          createdById: usuarioId ?? null,
        }, undefined, manager);

        await this.savePacienteRelations(patologiaRepository, necesidadRepository, savedFamiliar.id, fPatologias, fPatologiaIds, fNecesidadIds);

        const member = miembroRepository.create({
          nucleoId: savedNucleo.id,
          pacienteId: savedFamiliar.id,
          relacion: f.relacion,
        });
        await miembroRepository.save(member);
      }
    });

    return this.loadPacienteConNucleo(savedId);
  }

  private async savePacienteRelations(
    patologiaRepo: Repository<PacientePatologia>,
    necesidadRepo: Repository<PacienteNecesidad>,
    pacienteId: number,
    patologias?: { patologiaId: number; tratamiento?: string }[],
    patologiaIds?: number[],
    necesidadIds?: number[],
  ) {
    if (patologias && patologias.length > 0) {
      for (const p of patologias) {
        const entity = patologiaRepo.create({ pacienteId, patologiaId: p.patologiaId, tratamiento: p.tratamiento ?? null });
        await patologiaRepo.save(entity);
      }
    } else if (patologiaIds && patologiaIds.length > 0) {
      for (const pid of patologiaIds) {
        const entity = patologiaRepo.create({ pacienteId, patologiaId: pid });
        await patologiaRepo.save(entity);
      }
    }

    if (necesidadIds && necesidadIds.length > 0) {
      for (const nid of necesidadIds) {
        const entity = necesidadRepo.create({ pacienteId, necesidadId: nid });
        await necesidadRepo.save(entity);
      }
    }
  }

  async getPacienteById(id: number) {
    return this.loadPacienteConNucleo(id);
  }

  async getPacienteByIdEmergencia(idEmergencia: string) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idEmergencia, activo: true },
      relations: {
        _familiaresBacking: { paciente: true, nucleo: { miembros: { paciente: true }, titular: true } },
        pacientePatologias: { patologia: true },
        pacienteNecesidades: { necesidad: true, suplidaPor: true },
      },
    });

    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }

    return paciente;
  }

  async searchPacientes(query?: string, incluirInactivos?: boolean) {
    const q = query?.trim().toLowerCase() ?? '';
    if (!q) return [];
    const qb = this.pacienteRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p._familiaresBacking', 'nfm')
      .leftJoinAndSelect('nfm.paciente', 'nfm_paciente')
      .leftJoinAndSelect('nfm.nucleo', 'nf')
      .leftJoinAndSelect('nf.miembros', 'all_members')
      .leftJoinAndSelect('all_members.paciente', 'member_paciente')
      .leftJoinAndSelect('nf.titular', 'titular')
      .leftJoinAndSelect('p.pacientePatologias', 'pp')
      .leftJoinAndSelect('pp.patologia', 'pat')
      .leftJoinAndSelect('p.pacienteNecesidades', 'pn')
      .leftJoinAndSelect('pn.necesidad', 'nec')
      .leftJoinAndSelect('pn.suplidaPor', 'sp')
      .where('(LOWER(p.idEmergencia) LIKE :q OR LOWER(p.nombre) LIKE :q OR LOWER(p.apellido) LIKE :q OR p.cedula LIKE :q OR p.telefono LIKE :q)', { q: `%${q}%` })
      .take(20);
    if (!incluirInactivos) {
      qb.andWhere('p.activo = :activo', { activo: true });
    }
    return qb.getMany();
  }

  async updatePaciente(id: number, dto: ActualizarPacienteDto, usuarioId?: number) {
    const updateData: Record<string, unknown> = {};

    if (dto.nombre !== undefined) updateData['nombre'] = dto.nombre;
    if (dto.apellido !== undefined) updateData['apellido'] = dto.apellido;
    if (dto.cedula !== undefined) updateData['cedula'] = dto.cedula;
    if (dto.telefono !== undefined) updateData['telefono'] = dto.telefono;
    if (dto.sexo !== undefined) updateData['sexo'] = dto.sexo;
    if (dto.edadEstimada !== undefined) updateData['edadEstimada'] = dto.edadEstimada;
    if (dto.fechaNacimiento !== undefined) updateData['fechaNacimiento'] = dto.fechaNacimiento;
    if (dto.edadManual !== undefined) updateData['edadManual'] = dto.edadManual;
    if (dto.esRecienNacido !== undefined) updateData['esRecienNacido'] = dto.esRecienNacido;
    if (dto.pesoEstimado !== undefined) updateData['pesoEstimado'] = dto.pesoEstimado;
    if (dto.situacionVivienda !== undefined) updateData['situacionVivienda'] = dto.situacionVivienda;
    if (dto.tieneDiscapacidadMotora !== undefined) updateData['tieneDiscapacidadMotora'] = dto.tieneDiscapacidadMotora;
    if (dto.activo !== undefined) updateData['activo'] = dto.activo;

    // Compute edadEstimada if not explicitly provided
    if (dto.edadEstimada === undefined && (dto.fechaNacimiento !== undefined || dto.edadManual !== undefined || dto.esRecienNacido !== undefined)) {
      updateData['edadEstimada'] = this.computeEdadEstimada({
        esRecienNacido: dto.esRecienNacido ?? undefined,
        fechaNacimiento: dto.fechaNacimiento ?? undefined,
        edadManual: dto.edadManual ?? undefined,
      });
    }

    updateData['updatedById'] = usuarioId ?? null;

    if (Object.keys(updateData).length > 0) {
      const result = await this.pacienteRepository.update(id, updateData);
      if (result.affected === 0) {
        throw new NotFoundException('Patient not found');
      }
    }

    if (dto.patologias !== undefined || dto.patologiaIds !== undefined) {
      await this.pacientePatologiaRepository.delete({ pacienteId: id });
      const patologias = dto.patologias ?? [];
      const patologiaIds = dto.patologiaIds ?? [];
      if (patologias.length > 0) {
        for (const p of patologias) {
          const entity = this.pacientePatologiaRepository.create({ pacienteId: id, patologiaId: p.patologiaId, tratamiento: p.tratamiento ?? null });
          await this.pacientePatologiaRepository.save(entity);
        }
      } else if (patologiaIds.length > 0) {
        for (const pid of patologiaIds) {
          const entity = this.pacientePatologiaRepository.create({ pacienteId: id, patologiaId: pid });
          await this.pacientePatologiaRepository.save(entity);
        }
      }
    }

    if (dto.necesidadIds !== undefined) {
      const noSuplidas = await this.pacienteNecesidadRepository.find({
        where: { pacienteId: id, activo: true, suplida: false },
      });
      const toKeep = new Set(dto.necesidadIds);
      const toDelete = noSuplidas.filter((n) => !toKeep.has(n.necesidadId));
      if (toDelete.length > 0) {
        await this.pacienteNecesidadRepository.delete(toDelete.map((n) => n.id));
      }
      const existingNoSuplidaIds = new Set(noSuplidas.map((n) => n.necesidadId));
      for (const nid of dto.necesidadIds) {
        if (!existingNoSuplidaIds.has(nid)) {
          const entity = this.pacienteNecesidadRepository.create({ pacienteId: id, necesidadId: nid });
          await this.pacienteNecesidadRepository.save(entity);
        }
      }
    }

    return this.loadPacienteConNucleo(id);
  }

  async deletePaciente(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id },
    });
    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }
    paciente.activo = false;
    await this.pacienteRepository.save(paciente);
    return { success: true };
  }

  async getNucleo(pacienteId: number) {
    const memberEntry = await this.miembroRepository.findOne({
      where: { pacienteId, activo: true },
    });
    if (!memberEntry) return [];

    const allMembers = await this.miembroRepository.find({
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

  async agregarFamiliar(pacienteId: number, dto: AgregarFamiliarDto) {
    const miembro = await this.miembroRepository.findOne({
      where: { pacienteId, activo: true },
    });
    if (!miembro) {
      throw new NotFoundException('Patient is not part of a family nucleus');
    }

    const member = this.miembroRepository.create({
      nucleoId: miembro.nucleoId,
      pacienteId: dto.pacienteId,
      relacion: dto.relacion,
    });
    return this.miembroRepository.save(member);
  }

  async quitarFamiliar(pacienteId: number, miembroId: number) {
    const miembro = await this.miembroRepository.findOne({
      where: { id: miembroId, activo: true },
    });
    if (!miembro) {
      throw new NotFoundException('Family member not found');
    }
    miembro.activo = false;
    await this.miembroRepository.save(miembro);
    return { success: true };
  }

  async marcarNecesidadSuplida(pacienteId: number, necesidadId: number, usuarioId: number): Promise<PacienteNecesidad> {
    const necesidad = await this.pacienteNecesidadRepository.findOne({
      where: { id: necesidadId, pacienteId, activo: true, suplida: false },
      relations: { necesidad: true, suplidaPor: true },
    });
    if (!necesidad) {
      throw new NotFoundException('Necesidad no encontrada o ya suplida');
    }
    necesidad.suplida = true;
    necesidad.fechaSuplida = new Date();
    necesidad.suplidaPorId = usuarioId;
    return this.pacienteNecesidadRepository.save(necesidad);
  }

  async agregarPatologia(pacienteId: number, dto: { patologiaId: number; tratamiento?: string }, usuarioId: number): Promise<PacientePatologia> {
    const paciente = await this.pacienteRepository.findOne({ where: { id: pacienteId, activo: true } });
    if (!paciente) throw new NotFoundException('Patient not found');

    const catalogoPatologia = await this.dataSource.manager.findOne(CatalogoPatologia, { where: { id: dto.patologiaId } });
    if (!catalogoPatologia) throw new NotFoundException('Patología no encontrada en el catálogo');

    const entity = this.pacientePatologiaRepository.create({
      pacienteId,
      patologiaId: dto.patologiaId,
      tratamiento: dto.tratamiento ?? null,
      createdById: usuarioId,
    });
    return this.pacientePatologiaRepository.save(entity);
  }

  async quitarPatologia(pacienteId: number, patologiaId: number): Promise<{ success: boolean }> {
    const result = await this.pacientePatologiaRepository.delete({ pacienteId, patologiaId });
    if (result.affected === 0) throw new NotFoundException('Patologia no encontrada');
    return { success: true };
  }

  async agregarNecesidad(pacienteId: number, necesidadId: number, usuarioId: number): Promise<PacienteNecesidad> {
    const paciente = await this.pacienteRepository.findOne({ where: { id: pacienteId, activo: true } });
    if (!paciente) throw new NotFoundException('Patient not found');

    const catalogo = await this.dataSource.manager.findOne(CatalogoNecesidad, { where: { id: necesidadId } });
    if (!catalogo) throw new NotFoundException('Necesidad no encontrada en el catálogo');

    const entity = this.pacienteNecesidadRepository.create({
      pacienteId,
      necesidadId,
      createdById: usuarioId,
    });
    return this.pacienteNecesidadRepository.save(entity);
  }

  async quitarNecesidad(pacienteId: number, necesidadId: number): Promise<{ success: boolean }> {
    const necesidad = await this.pacienteNecesidadRepository.findOne({
      where: { necesidadId, pacienteId, activo: true },
    });
    if (!necesidad) throw new NotFoundException('Necesidad no encontrada');
    necesidad.activo = false;
    await this.pacienteNecesidadRepository.save(necesidad);
    return { success: true };
  }

  private async loadPacienteConNucleo(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, activo: true },
      relations: {
        _familiaresBacking: { paciente: true, nucleo: { miembros: { paciente: true }, titular: true } },
        pacientePatologias: { patologia: true },
        pacienteNecesidades: { necesidad: true, suplidaPor: true },
      },
    });
    if (!paciente) throw new NotFoundException('Patient not found');
    return paciente;
  }

  private async generateNextEmergenciaId(manager?: EntityManager): Promise<string> {
    const year = new Date().getFullYear();
    const repo = manager ? manager.getRepository(Paciente) : this.pacienteRepository;
    const lastPaciente = await repo
      .createQueryBuilder('p')
      .where('p.idEmergencia LIKE :pattern', { pattern: `EM-${year}-%` })
      .orderBy('p.id', 'DESC')
      .getOne();
    let nextSeq = 1;
    if (lastPaciente) {
      const parts = lastPaciente.idEmergencia.split('-');
      nextSeq = parseInt(parts[parts.length - 1], 10) + 1;
    }
    return `EM-${year}-${String(nextSeq).padStart(3, '0')}`;
  }

  private computeEdadEstimada(dto: { esRecienNacido?: boolean; fechaNacimiento?: string; edadManual?: number; edadEstimada?: number }): number {
    if (dto.edadEstimada !== undefined) {
      return dto.edadEstimada;
    }
    if (dto.esRecienNacido) {
      return 0;
    }
    if (dto.fechaNacimiento) {
      const nacimiento = new Date(dto.fechaNacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mesDiff = hoy.getMonth() - nacimiento.getMonth();
      if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return Math.max(0, edad);
    }
    if (dto.edadManual !== undefined) {
      return dto.edadManual;
    }
    return 0;
  }

  private async savePacienteWithUniqueId(
    pacienteRepository: Repository<Paciente>,
    payload: Partial<Paciente>,
    fixedIdEmergencia?: string,
    manager?: EntityManager,
  ): Promise<Paciente> {
    if (fixedIdEmergencia) {
      try {
        const paciente = pacienteRepository.create({ ...payload, idEmergencia: fixedIdEmergencia });
        return await pacienteRepository.save(paciente);
      } catch (error) {
        if (this.isIdEmergenciaConflict(error)) {
          throw new ConflictException('El ID de emergencia ya existe. Intente nuevamente.');
        }
        throw new InternalServerErrorException('No se pudo registrar el paciente.');
      }
    }

    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const idEmergencia = await this.generateNextEmergenciaId(manager);
      try {
        const paciente = pacienteRepository.create({ ...payload, idEmergencia });
        return await pacienteRepository.save(paciente);
      } catch (error: unknown) {
        if (this.isIdEmergenciaConflict(error) && attempt < maxAttempts - 1) {
          continue;
        }
        throw new InternalServerErrorException('No se pudo registrar el paciente.');
      }
    }

    throw new InternalServerErrorException('No se pudo registrar el paciente.');
  }

  private isIdEmergenciaConflict(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const message = String((error as { message?: string }).message ?? '');
    return message.includes('UNIQUE constraint failed: paciente.id_emergencia');
  }
}
