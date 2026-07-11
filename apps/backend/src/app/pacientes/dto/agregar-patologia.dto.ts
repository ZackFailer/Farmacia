import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class AgregarPatologiaDto {
  @IsInt()
  patologiaId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tratamiento?: string;
}
