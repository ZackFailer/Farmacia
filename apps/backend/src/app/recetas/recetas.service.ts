import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receta } from '../common/entities/receta.entity';
import { RecetaDetalle } from '../common/entities/receta-detalle.entity';
import { CrearRecetaDto } from './dto/crear-receta.dto';
import { ActualizarEstadoRecetaDto } from './dto/actualizar-estado-receta.dto';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(RecetaDetalle)
    private readonly detalleRepository: Repository<RecetaDetalle>,
  ) {}

  async createReceta(dto: CrearRecetaDto, doctorId: number) {
    const receta = this.recetaRepository.create({
      pacienteId: dto.pacienteId,
      doctorId,
      fechaHora: new Date(),
      estado: 'pendiente',
      motivo: dto.motivo ?? null,
    });
    const saved = await this.recetaRepository.save(receta);

    const detalles = dto.detalles.map((det) =>
      this.detalleRepository.create({
        recetaId: saved.id,
        medicamentoId: det.medicamentoId,
        cantidadRecetada: det.cantidadRecetada,
        dias: det.dias,
        dosisIndicada: det.dosisIndicada ?? null,
      }),
    );
    await this.detalleRepository.save(detalles);

    return this.getReceta(saved.id);
  }

  async getReceta(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { id, activo: true },
      relations: {
        paciente: true,
        doctor: true,
        detalles: { medicamento: true },
      },
    });
    if (!receta) throw new NotFoundException('Receta not found');
    return receta;
  }

  async getRecetasPendientes() {
    return this.recetaRepository.find({
      where: { estado: 'pendiente', activo: true },
      relations: {
        paciente: true,
        doctor: true,
        detalles: { medicamento: true },
      },
      order: { fechaHora: 'ASC' },
    });
  }

  async getRecetasByPaciente(pacienteId: number) {
    return this.recetaRepository.find({
      where: { pacienteId, activo: true },
      relations: {
        doctor: true,
        detalles: { medicamento: true },
      },
      order: { fechaHora: 'DESC' },
    });
  }

  async updateEstado(id: number, dto: ActualizarEstadoRecetaDto) {
    const receta = await this.recetaRepository.findOne({
      where: { id, activo: true },
    });
    if (!receta) throw new NotFoundException('Receta not found');

    receta.estado = dto.estado;
    return this.recetaRepository.save(receta);
  }
}
