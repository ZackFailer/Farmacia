import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Sex } from '../../common/enums/sex.enum';
import { PacientePatologiaDto } from './crear-paciente.dto';

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
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  edadManual?: number;

  @IsOptional()
  @IsBoolean()
  esRecienNacido?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  pesoEstimado?: number;

  @IsOptional()
  @IsBoolean()
  esDamnificado?: boolean;

  @IsOptional()
  @IsBoolean()
  tieneDiscapacidadMotora?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  patologiaIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PacientePatologiaDto)
  patologias?: PacientePatologiaDto[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  necesidadIds?: number[];
}
