import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CrearRecetaDetalleDto {
  @IsNumber()
  medicamentoId!: number;

  @IsInt()
  @Min(1)
  cantidadRecetada!: number;

  @IsInt()
  @Min(1)
  dias!: number;

  @IsOptional()
  @IsString()
  dosisIndicada?: string;
}

export class CrearRecetaDto {
  @IsNumber()
  pacienteId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearRecetaDetalleDto)
  detalles!: CrearRecetaDetalleDto[];
}
