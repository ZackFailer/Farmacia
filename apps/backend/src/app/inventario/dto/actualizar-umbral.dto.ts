import { IsInt, Min } from 'class-validator';

export class ActualizarUmbralDto {
  @IsInt()
  @Min(0)
  umbralMinimo!: number;
}
