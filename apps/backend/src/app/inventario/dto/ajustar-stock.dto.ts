import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AjustarStockDto {
  @IsInt()
  @Min(0)
  cantidadReal!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}
