import { IsInt } from 'class-validator';

export class AgregarNecesidadDto {
  @IsInt()
  necesidadId!: number;
}
