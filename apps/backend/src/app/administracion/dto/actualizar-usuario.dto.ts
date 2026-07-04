import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4,6}$/)
  pin?: string;
}
