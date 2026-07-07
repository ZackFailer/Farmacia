import { Type } from 'class-transformer';
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
import { Sex } from '../../common/enums/sex.enum';

export class CrearPacienteFamiliarDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

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

  @IsEnum(Sex)
  sexo!: Sex;

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

  @IsNumber()
  @Min(0.1)
  pesoEstimado!: number;

  @IsBoolean()
  esDamnificado!: boolean;

  @IsOptional()
  @IsBoolean()
  tieneDiscapacidadMotora?: boolean;

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

  @IsString()
  @MaxLength(30)
  relacion!: string;
}

export class PacientePatologiaDto {
  @IsInt()
  patologiaId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tratamiento?: string;
}

export class CrearPacienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  idEmergencia?: string;

  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @MaxLength(120)
  apellido!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsEnum(Sex)
  sexo!: Sex;

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

  @IsNumber()
  @Min(0.1)
  pesoEstimado!: number;

  @IsBoolean()
  esDamnificado!: boolean;

  @IsOptional()
  @IsBoolean()
  tieneCargaFamiliar?: boolean;

  @IsOptional()
  @IsBoolean()
  tieneDiscapacidadMotora?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPacienteFamiliarDto)
  familiares?: CrearPacienteFamiliarDto[];

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
