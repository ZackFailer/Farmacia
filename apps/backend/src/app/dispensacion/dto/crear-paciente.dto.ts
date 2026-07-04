import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Sex } from '../../common/enums/sex.enum';

export class CrearPacienteDto {
  @IsString()
  @MaxLength(60)
  idEmergencia!: string;

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
}
