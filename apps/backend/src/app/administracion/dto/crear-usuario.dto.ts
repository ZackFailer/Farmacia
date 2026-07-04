import { IsEnum, IsString, Matches, MaxLength } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class CrearUsuarioDto {
  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsEnum(UserRole)
  rol!: UserRole;

  @IsString()
  @Matches(/^\d{4,6}$/)
  pin!: string;
}
