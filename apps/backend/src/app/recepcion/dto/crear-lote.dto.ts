import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearLoteDto {
  @IsInt()
  medicamentoId!: number;

  @IsInt()
  @Min(1)
  cantidadInicial!: number;

  @IsDateString()
  fechaVencimiento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  donante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ubicacion?: string;
}
