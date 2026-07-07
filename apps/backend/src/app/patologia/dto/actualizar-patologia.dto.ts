import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPatologiaDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
