import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CrearDispensacionDetalleDto } from './crear-dispensacion-detalle.dto';

export class CrearDispensacionDto {
  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsInt()
  recetaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearDispensacionDetalleDto)
  detalles!: CrearDispensacionDetalleDto[];
}
