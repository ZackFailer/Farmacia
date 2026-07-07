import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearCarpaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ubicacion?: string;
}
