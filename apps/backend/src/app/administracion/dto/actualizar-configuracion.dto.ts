import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class ActualizarConfiguracionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  umbralMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dosisMaximaMgKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  pesoReferenciaKg?: number;
}
