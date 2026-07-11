import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CrearRecetaDetalleDto {
  @IsInt()
  medicamentoId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadRecetada?: number;

  @IsInt()
  @Min(1)
  dias!: number;

  @IsOptional()
  @IsString()
  dosisIndicada?: string;
}

export class CrearRecetaDto {
  @IsInt()
  pacienteId!: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearRecetaDetalleDto)
  detalles!: CrearRecetaDetalleDto[];
}
