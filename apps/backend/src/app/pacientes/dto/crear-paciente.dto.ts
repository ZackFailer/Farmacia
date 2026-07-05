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

  @IsInt()
  @Min(0)
  edadEstimada!: number;

  @IsNumber()
  @Min(0.1)
  pesoEstimado!: number;

  @IsBoolean()
  esDamnificado!: boolean;

  @IsString()
  @MaxLength(30)
  relacion!: string;
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

  @IsInt()
  @Min(0)
  edadEstimada!: number;

  @IsNumber()
  @Min(0.1)
  pesoEstimado!: number;

  @IsBoolean()
  esDamnificado!: boolean;

  @IsOptional()
  @IsBoolean()
  tieneCargaFamiliar?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPacienteFamiliarDto)
  familiares?: CrearPacienteFamiliarDto[];
}
