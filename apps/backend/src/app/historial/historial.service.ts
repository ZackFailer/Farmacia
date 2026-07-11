import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { Paciente } from '../common/entities/paciente.entity';

@Injectable()
export class HistorialService {
  constructor(
    @InjectRepository(Dispensacion)
    private readonly dispensacionRepository: Repository<Dispensacion>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
  ) {}

  async getHistorialPaciente(idEmergencia: string) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idEmergencia, activo: true },
    });

    if (!paciente) {
      throw new NotFoundException('Patient not found');
    }

    return this.dispensacionRepository.find({
      where: { pacienteId: paciente.id, activo: true },
      relations: {
        usuario: true,
        receta: { detalles: { medicamento: true } },
        detalles: { medicamento: true },
      },
      order: { fechaHora: 'DESC' },
    });
  }

  async getDetalleDispensacion(id: number) {
    const dispensacion = await this.dispensacionRepository.findOne({
      where: { id, activo: true },
      relations: {
        paciente: true,
        usuario: true,
        receta: { detalles: { medicamento: true } },
        detalles: { medicamento: true },
      },
    });

    if (!dispensacion) {
      throw new NotFoundException('Dispensation not found');
    }

    return dispensacion;
  }
}
