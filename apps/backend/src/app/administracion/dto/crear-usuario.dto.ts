import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/role.enum';

export class CrearUsuarioDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Solo letras, números y guión bajo' })
  username!: string;

  @IsString()
  @MaxLength(120)
  nombre!: string;

  @IsEnum(UserRole)
  rol!: UserRole;

  @IsString()
  @Matches(/^\d{4,6}$/)
  pin!: string;
}
