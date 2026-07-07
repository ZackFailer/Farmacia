import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { CatalogoPatologia } from '../common/entities/patologia.entity';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';
import { CrearCarpaDto } from './dto/crear-carpa.dto';

@Injectable()
export class CensoService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(NucleoFamiliar)
    private readonly nucleoRepository: Repository<NucleoFamiliar>,
    @InjectRepository(NucleoFamiliarMiembro)
    private readonly miembroRepository: Repository<NucleoFamiliarMiembro>,
    @InjectRepository(CatalogoPatologia)
    private readonly patologiaRepository: Repository<CatalogoPatologia>,
    @InjectRepository(CatalogoNecesidad)
    private readonly necesidadRepository: Repository<CatalogoNecesidad>,
  ) {}

  async getEstadisticas() {
    const pacientes = await this.pacienteRepository.find({ where: { activo: true } });

    const totalPacientes = pacientes.length;
    const masculinos = pacientes.filter(p => p.sexo === 'M').length;
    const femeninos = pacientes.filter(p => p.sexo === 'F').length;

    const calcularEdad = (p: Paciente): number => {
      if (p.esRecienNacido) return 0;
      if (p.fechaNacimiento) {
        const nacimiento = new Date(p.fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mesDiff = hoy.getMonth() - nacimiento.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
        return Math.max(0, edad);
      }
      return p.edadManual ?? 0;
    };

    const recienNacidos = pacientes.filter(p => p.esRecienNacido).length;
    const preescolares = pacientes.filter(p => !p.esRecienNacido && calcularEdad(p) < 5).length;
    const escolares = pacientes.filter(p => !p.esRecienNacido && calcularEdad(p) >= 6 && calcularEdad(p) <= 10).length;
    const adolescentes = pacientes.filter(p => !p.esRecienNacido && calcularEdad(p) >= 11 && calcularEdad(p) <= 15).length;
    const adultos = pacientes.filter(p => !p.esRecienNacido && calcularEdad(p) >= 16 && calcularEdad(p) <= 59).length;
    const adultosMayores = pacientes.filter(p => !p.esRecienNacido && calcularEdad(p) >= 60).length;

    const conDiscapacidadMotora = pacientes.filter(p => p.tieneDiscapacidadMotora).length;

    const totalCarpas = await this.nucleoRepository.count({
      where: { activo: true },
    });

    const patologias = await this.patologiaRepository.find({ where: { activo: true } });
    const patologiaStats = [];
    for (const pat of patologias) {
      const count = await this.pacienteRepository
        .createQueryBuilder('p')
        .innerJoin('paciente_patologia', 'pp', 'pp.paciente_id = p.id')
        .where('pp.patologia_id = :pid AND p.activo = true', { pid: pat.id })
        .getCount();
      patologiaStats.push({ id: pat.id, nombre: pat.nombre, count });
    }

    const necesidades = await this.necesidadRepository.find({ where: { activo: true } });
    const necesidadStats = [];
    for (const nec of necesidades) {
      const count = await this.pacienteRepository
        .createQueryBuilder('p')
        .innerJoin('paciente_necesidad', 'pn', 'pn.paciente_id = p.id')
        .where('pn.necesidad_id = :nid AND p.activo = true', { nid: nec.id })
        .getCount();
      necesidadStats.push({ id: nec.id, nombre: nec.nombre, count });
    }

    const ubicaciones = await this.nucleoRepository
      .createQueryBuilder('nf')
      .select('nf.ubicacion', 'ubicacion')
      .addSelect('COUNT(DISTINCT nf.id)', 'count')
      .where('nf.activo = true AND nf.ubicacion IS NOT NULL')
      .groupBy('nf.ubicacion')
      .getRawMany();

    return {
      totalPacientes,
      masculinos,
      femeninos,
      recienNacidos,
      preescolares,
      escolares,
      adolescentes,
      adultos,
      adultosMayores,
      conDiscapacidadMotora,
      totalCarpas,
      porPatologia: patologiaStats,
      porNecesidad: necesidadStats,
      porUbicacion: ubicaciones,
    };
  }

  async crearCarpa(dto: CrearCarpaDto): Promise<NucleoFamiliar> {
    const lastCarpa = await this.nucleoRepository
      .createQueryBuilder('nf')
      .where('nf.codigoCarpa LIKE :pattern', { pattern: 'CARPA-%' })
      .orderBy('nf.id', 'DESC')
      .getOne();

    let nextSeq = 1;
    if (lastCarpa?.codigoCarpa) {
      const parts = lastCarpa.codigoCarpa.split('-');
      nextSeq = parseInt(parts[parts.length - 1], 10) + 1;
    }

    const codigoCarpa = `CARPA-${String(nextSeq).padStart(4, '0')}`;
    const entity = this.nucleoRepository.create({
      codigoCarpa,
      ubicacion: dto.ubicacion ?? null,
    });
    return this.nucleoRepository.save(entity);
  }

  async listarCarpas(): Promise<NucleoFamiliar[]> {
    return this.nucleoRepository.find({
      where: { activo: true },
      relations: { miembros: { paciente: true }, titular: true },
      order: { createdAt: 'DESC' },
    });
  }

  async agregarMiembroCarpa(codigo: string, dto: { pacienteId: number; relacion?: string }): Promise<NucleoFamiliarMiembro> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');

    const member = this.miembroRepository.create({
      nucleoId: carpa.id,
      pacienteId: dto.pacienteId,
      relacion: dto.relacion ?? 'Miembro',
    });
    return this.miembroRepository.save(member);
  }

  async actualizarCarpa(codigo: string, dto: { ubicacion?: string }): Promise<NucleoFamiliar> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');
    if (dto.ubicacion !== undefined) carpa.ubicacion = dto.ubicacion;
    return this.nucleoRepository.save(carpa);
  }

  async eliminarCarpa(codigo: string): Promise<{ success: boolean }> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');
    carpa.activo = false;
    await this.nucleoRepository.save(carpa);
    return { success: true };
  }

  async getCarpaByCodigo(codigo: string): Promise<NucleoFamiliar> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
      relations: {
        miembros: {
          paciente: {
            pacientePatologias: { patologia: true },
            pacienteNecesidades: { necesidad: true },
          },
        },
        titular: true,
      },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');
    return carpa;
  }
}
