import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarLoteDto {
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  donante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ubicacion?: string;
}
