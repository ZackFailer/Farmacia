import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearNecesidadDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}
