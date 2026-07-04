import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
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
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

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

  async getPacienteById(id: number) {
    return this.loadPacienteConNucleo(id);
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
      .andWhere('(LOWER(p.idEmergencia) LIKE :q OR LOWER(p.nombre) LIKE :q OR LOWER(p.apellido) LIKE :q OR p.cedula LIKE :q)', { q: `%${q}%` })
      .take(20)
      .getMany();
  }

  async updatePaciente(id: number, dto: ActualizarPacienteDto) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, activo: true },
    });
    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }

    if (dto.nombre !== undefined) paciente.nombre = dto.nombre;
    if (dto.apellido !== undefined) paciente.apellido = dto.apellido;
    if (dto.cedula !== undefined) paciente.cedula = dto.cedula;
    if (dto.sexo !== undefined) paciente.sexo = dto.sexo;
    if (dto.edadEstimada !== undefined) paciente.edadEstimada = dto.edadEstimada;
    if (dto.pesoEstimado !== undefined) paciente.pesoEstimado = dto.pesoEstimado;
    if (dto.esDamnificado !== undefined) paciente.esDamnificado = dto.esDamnificado;

    await this.pacienteRepository.save(paciente);
    return this.loadPacienteConNucleo(id);
  }

  async softDeletePaciente(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, activo: true },
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

  private async loadPacienteConNucleo(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { id, activo: true },
      relations: { familiares: { nucleo: { miembros: { paciente: true }, titular: true } } },
    });
    if (!paciente) throw new NotFoundException('Patient not found');
    return paciente;
  }

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
}
