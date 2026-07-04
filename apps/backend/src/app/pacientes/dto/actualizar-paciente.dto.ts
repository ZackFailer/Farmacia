import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Sex } from '../../common/enums/sex.enum';

export class ActualizarPacienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEnum(Sex)
  sexo?: Sex;

  @IsOptional()
  @IsInt()
  @Min(0)
  edadEstimada?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  pesoEstimado?: number;

  @IsOptional()
  @IsBoolean()
  esDamnificado?: boolean;
}
