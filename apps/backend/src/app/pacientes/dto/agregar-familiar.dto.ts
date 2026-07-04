import { IsNumber, IsString, MaxLength } from 'class-validator';

export class AgregarFamiliarDto {
  @IsNumber()
  pacienteId!: number;

  @IsString()
  @MaxLength(30)
  relacion!: string;
}
