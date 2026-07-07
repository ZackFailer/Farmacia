import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ActualizarMedicamentoDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombreGenerico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombreComercial?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  presentacion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  concentracion?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  unidadConcentracion?: string;

  @IsOptional()
  @IsBoolean()
  esVital?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
