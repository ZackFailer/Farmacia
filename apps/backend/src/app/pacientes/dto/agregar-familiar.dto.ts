import { IsInt, IsString, MaxLength } from 'class-validator';

export class AgregarFamiliarDto {
  @IsInt()
  pacienteId!: number;

  @IsString()
  @MaxLength(30)
  relacion!: string;
}
