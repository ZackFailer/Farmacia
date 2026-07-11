import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Medicamento } from '../common/entities/medicamento.entity';
import { Paciente } from '../common/entities/paciente.entity';
import { Receta } from '../common/entities/receta.entity';
import { Configuracion } from '../common/entities/configuracion.entity';
import { Dispensacion } from '../common/entities/dispensacion.entity';
import { DispensacionDetalle } from '../common/entities/dispensacion-detalle.entity';
import { Lote } from '../common/entities/lote.entity';
import { CrearDispensacionDto } from './dto/crear-dispensacion.dto';

@Injectable()
export class DispensacionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getDoseConfig(medicamentoId: number) {
    const config = await this.dataSource.manager.findOne(Configuracion, {
      where: { medicamentoId, activo: true },
      relations: { medicamento: true },
    });
    return config ?? null;
  }

  async crearDispensacion(dto: CrearDispensacionDto, usuarioId: number) {
    return this.dataSource.transaction(async (manager) => {
      const paciente = await manager.findOne(Paciente, {
        where: { id: dto.pacienteId, activo: true },
      });
      if (!paciente) {
        throw new NotFoundException('Patient not found');
      }

      if (dto.recetaId) {
        const receta = await manager.findOne(Receta, {
          where: { id: dto.recetaId, activo: true },
        });
        if (!receta) {
          throw new NotFoundException('Receta not found');
        }
        if (receta.estado !== 'pendiente') {
          throw new BadRequestException('Receta is not pending');
        }
        receta.estado = 'despachada';
        await manager.save(Receta, receta);
      }

      const dispensacion = manager.create(Dispensacion, {
        pacienteId: paciente.id,
        usuarioId,
        fechaHora: new Date(),
        observaciones: dto.observaciones ?? null,
        recetaId: dto.recetaId ?? null,
      });
      const savedDispensacion = await manager.save(Dispensacion, dispensacion);

      for (const item of dto.detalles) {
        const medicamento = await manager.findOne(Medicamento, {
          where: { id: item.medicamentoId, activo: true },
        });
        if (!medicamento) {
          throw new NotFoundException(`Medication ${item.medicamentoId} not found`);
        }

        const config = await manager.findOne(Configuracion, {
          where: { medicamentoId: item.medicamentoId, activo: true },
        });

        const peso = paciente.pesoEstimado || (config?.pesoReferenciaKg ?? 70);
        const dosisMgKg = (item.cantidad * medicamento.concentracion) / peso;

        if (
          config &&
          config.dosisMaximaMgKg > 0 &&
          dosisMgKg > config.dosisMaximaMgKg
        ) {
          throw new BadRequestException(
            `Dose exceeds maximum for medication ${item.medicamentoId}`,
          );
        }

        if (item.loteId) {
          const lote = await manager.findOne(Lote, {
            where: { id: item.loteId, medicamentoId: item.medicamentoId, activo: true },
          });
          if (!lote) {
            throw new NotFoundException(`Lote ${item.loteId} not found for medication ${item.medicamentoId}`);
          }
          if (lote.cantidadActual < item.cantidad) {
            throw new BadRequestException(
              `Insufficient stock in lote ${item.loteId}: available ${lote.cantidadActual}, requested ${item.cantidad}`,
            );
          }
          lote.cantidadActual -= item.cantidad;
          await manager.save(Lote, lote);
        }

        const detalle = manager.create(DispensacionDetalle, {
          dispensacionId: savedDispensacion.id,
          medicamentoId: item.medicamentoId,
          cantidad: item.cantidad,
          dosisMgKg,
          loteId: item.loteId ?? undefined,
        });
        await manager.save(DispensacionDetalle, detalle);
      }

      return manager.findOne(Dispensacion, {
        where: { id: savedDispensacion.id },
        relations: {
          paciente: true,
          usuario: true,
          detalles: { medicamento: true },
        },
      });
    });
  }
}
