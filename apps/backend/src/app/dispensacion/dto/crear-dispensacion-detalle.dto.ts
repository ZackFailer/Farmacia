import { IsInt, Min } from 'class-validator';

export class CrearDispensacionDetalleDto {
  @IsInt()
  medicamentoId!: number;

  @IsInt()
  loteId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;
}
