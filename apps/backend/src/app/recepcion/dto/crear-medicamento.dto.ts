import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CrearMedicamentoDto {
  @IsString()
  @MaxLength(120)
  nombreGenerico!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombreComercial?: string;

  @IsString()
  @MaxLength(80)
  presentacion!: string;

  @IsNumber()
  @Min(0.0001)
  concentracion!: number;
}
