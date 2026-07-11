import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Paciente } from '../common/entities/paciente.entity';
import { NucleoFamiliar } from '../common/entities/nucleo-familiar.entity';
import { NucleoFamiliarMiembro } from '../common/entities/nucleo-familiar-miembro.entity';
import { CatalogoPatologia } from '../common/entities/patologia.entity';
import { CatalogoNecesidad } from '../common/entities/necesidad.entity';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { Usuario } from '../common/entities/usuario.entity';
import { CrearCarpaDto } from './dto/crear-carpa.dto';
import type { ExportarCensoResponse, PacienteExportRow, DispensacionExportRow } from './dto/exportar-censo.dto';

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
    @InjectRepository(Medicamento)
    private readonly medicamentoRepository: Repository<Medicamento>,
    @InjectRepository(Dispensacion)
    private readonly dispensacionRepository: Repository<Dispensacion>,
    @InjectRepository(DispensacionDetalle)
    private readonly detalleRepository: Repository<DispensacionDetalle>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
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

    const totalNoAfectados = pacientes.filter(p => p.situacionVivienda === 'no_afectado').length;
    const totalViviendaAfectada = pacientes.filter(p => p.situacionVivienda === 'vivienda_afectada').length;
    const totalDamnificados = pacientes.filter(p => p.situacionVivienda === 'damnificado').length;

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
      totalNoAfectados,
      totalViviendaAfectada,
      totalDamnificados,
      totalCarpas,
      porPatologia: patologiaStats,
      porNecesidad: necesidadStats,
      porUbicacion: ubicaciones,
    };
  }

  async crearCarpa(dto: CrearCarpaDto, usuarioId?: number): Promise<NucleoFamiliar> {
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
      createdById: usuarioId ?? null,
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

  async agregarMiembroCarpa(codigo: string, dto: { pacienteId: number; relacion?: string }, usuarioId?: number): Promise<NucleoFamiliarMiembro> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');

    const member = this.miembroRepository.create({
      nucleoId: carpa.id,
      pacienteId: dto.pacienteId,
      relacion: dto.relacion ?? 'Miembro',
      createdById: usuarioId ?? null,
    });
    return this.miembroRepository.save(member);
  }

  async actualizarCarpa(codigo: string, dto: { ubicacion?: string }, usuarioId?: number): Promise<NucleoFamiliar> {
    const carpa = await this.nucleoRepository.findOne({
      where: { codigoCarpa: codigo, activo: true },
    });
    if (!carpa) throw new NotFoundException('Carpa no encontrada');
    if (dto.ubicacion !== undefined) carpa.ubicacion = dto.ubicacion;
    carpa.updatedById = usuarioId ?? null;
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

  async exportarCenso(): Promise<ExportarCensoResponse> {
    const metrica = await this.getEstadisticas();

    const carpas = await this.nucleoRepository.find({
      where: { activo: true },
      relations: {
        miembros: {
          paciente: {
            pacientePatologias: { patologia: true },
            pacienteNecesidades: { necesidad: true },
          },
        },
        titular: true,
      },
      order: { codigoCarpa: 'ASC' },
    });

    const pacientesEnCarpa = new Set<number>();
    const pacientes: PacienteExportRow[] = [];

    for (const carpa of carpas) {
      for (const miembro of carpa.miembros) {
        if (!miembro.paciente || !miembro.paciente.activo) continue;
        pacientesEnCarpa.add(miembro.paciente.id);
        pacientes.push({
          carpa: carpa.codigoCarpa ?? 'SIN CODIGO',
          ubicacion: carpa.ubicacion,
          idEmergencia: miembro.paciente.idEmergencia,
          nombre: miembro.paciente.nombre,
          apellido: miembro.paciente.apellido,
          cedula: miembro.paciente.cedula,
          telefono: miembro.paciente.telefono,
          sexo: miembro.paciente.sexo,
          edadEstimada: miembro.paciente.edadEstimada,
          pesoEstimado: miembro.paciente.pesoEstimado,
          situacionVivienda: miembro.paciente.situacionVivienda,
          tieneDiscapacidadMotora: miembro.paciente.tieneDiscapacidadMotora ?? false,
          relacion: miembro.relacion,
          patologias: (miembro.paciente.pacientePatologias ?? [])
            .map(pp => ({ nombre: pp.patologia.nombre, tratamiento: pp.tratamiento })),
          necesidades: (miembro.paciente.pacienteNecesidades ?? [])
            .filter(pn => pn.activo !== false)
            .map(pn => ({ nombre: pn.necesidad.nombre, suplida: pn.suplida })),
        });
      }
    }

    const todosLosPacientes = await this.pacienteRepository.find({
      where: { activo: true },
      relations: {
        pacientePatologias: { patologia: true },
        pacienteNecesidades: { necesidad: true },
      },
    });

    for (const p of todosLosPacientes) {
      if (pacientesEnCarpa.has(p.id)) continue;
      pacientes.push({
        carpa: 'SIN CARPA',
        ubicacion: null,
        idEmergencia: p.idEmergencia,
        nombre: p.nombre,
        apellido: p.apellido,
        cedula: p.cedula,
        telefono: p.telefono,
        sexo: p.sexo,
        edadEstimada: p.edadEstimada,
        pesoEstimado: p.pesoEstimado,
        situacionVivienda: p.situacionVivienda,
        tieneDiscapacidadMotora: p.tieneDiscapacidadMotora ?? false,
        relacion: 'Titular',
        patologias: (p.pacientePatologias ?? [])
          .map(pp => ({ nombre: pp.patologia.nombre, tratamiento: pp.tratamiento })),
        necesidades: (p.pacienteNecesidades ?? [])
          .filter(pn => pn.activo !== false)
          .map(pn => ({ nombre: pn.necesidad.nombre, suplida: pn.suplida })),
      });
    }

    const manager = this.dataSource.manager;

    const totalMedicamentos = await manager
      .createQueryBuilder(Medicamento, 'm')
      .where('m.activo = :activo', { activo: true })
      .getCount();

    const totalDispensaciones = await manager
      .createQueryBuilder(Dispensacion, 'd')
      .where('d.activo = :activo', { activo: true })
      .getCount();

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

    const hoy = new Date();
    let promedioDosisPorDia = 0;
    if (primeraDispensacion?.minFecha) {
      const inicio = new Date(primeraDispensacion.minFecha);
      const dias = Math.max(1, Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)));
      promedioDosisPorDia = Math.round((dosisTotales?.total ?? 0) / dias);
    }

    const medicamentosMasDispensados = await manager
      .createQueryBuilder(DispensacionDetalle, 'dd')
      .innerJoin(Medicamento, 'm', 'm.id = dd.medicamento_id')
      .select('dd.medicamento_id', 'medicamentoId')
      .addSelect('m.nombre_generico', 'medicamento')
      .addSelect('m.presentacion', 'presentacion')
      .addSelect("CONCAT(m.concentracion, ' ', m.unidad_concentracion)", 'concentracion')
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

    const todosMedicamentos = await manager
      .createQueryBuilder(Medicamento, 'm')
      .select('m.id', 'id')
      .addSelect('m.nombre_generico', 'nombre')
      .where('m.activo = :activo', { activo: true })
      .getRawMany<{ id: number; nombre: string }>();

    const medicamentosSinMovimientos = todosMedicamentos
      .filter(m => !idsConMovimiento.includes(m.id))
      .map(m => ({ id: m.id, nombre: m.nombre }));

    const dispensaciones = await this.dispensacionRepository.find({
      where: { activo: true },
      relations: {
        detalles: { medicamento: true },
        paciente: true,
        usuario: true,
      },
      order: { fechaHora: 'DESC' },
    });

    const dispensacionesExport: DispensacionExportRow[] = dispensaciones.map(d => ({
      id: d.id,
      fechaHora: d.fechaHora instanceof Date ? d.fechaHora.toISOString() : String(d.fechaHora),
      idEmergencia: d.paciente?.idEmergencia ?? '',
      pacienteNombre: d.paciente?.nombre ?? '',
      pacienteApellido: d.paciente?.apellido ?? '',
      cedula: d.paciente?.cedula ?? null,
      sexo: d.paciente?.sexo ?? '',
      edadEstimada: d.paciente?.edadEstimada ?? 0,
      despachadoPor: d.usuario?.nombre ?? 'Desconocido',
      items: (d.detalles ?? []).filter(dt => dt.activo !== false).map(dt => ({
        medicamento: dt.medicamento?.nombreGenerico ?? 'Desconocido',
        presentacion: dt.medicamento?.presentacion ?? '',
        concentracion: dt.medicamento ? `${dt.medicamento.concentracion} ${dt.medicamento.unidadConcentracion}` : '',
        cantidad: dt.cantidad,
        dosisMgKg: dt.dosisMgKg,
      })),
    }));

    return {
      metrica,
      pacientes,
      metricaMedicamentos: {
        totalMedicamentos,
        totalDispensaciones,
        totalDosis: dosisTotales?.total ?? 0,
        promedioDosisPorDia,
        medicamentosMasDispensados: medicamentosMasDispensados.map(m => ({
          medicamento: m.medicamento,
          medicamentoId: Number(m.medicamentoId),
          presentacion: m.presentacion ?? '',
          concentracion: m.concentracion ?? '',
          totalDosis: Number(m.totalDosis),
          pacientes: Number(m.pacientes),
        })),
        medicamentosSinMovimientos,
      },
      dispensaciones: dispensacionesExport,
    };
  }
}
