import { IsInt, IsString, IsOptional } from 'class-validator';

export class AgregarMiembroCarpaDto {
  @IsInt()
  pacienteId!: number;

  @IsString()
  @IsOptional()
  relacion?: string;
}
