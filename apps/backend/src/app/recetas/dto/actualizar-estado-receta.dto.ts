import { IsEnum } from 'class-validator';
import { RecetaEstado } from '../../common/entities/receta.entity';

export class ActualizarEstadoRecetaDto {
  @IsEnum(['pendiente', 'despachada', 'cancelada'] as const)
  estado!: RecetaEstado;
}
