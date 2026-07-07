import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarCarpaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;
}
