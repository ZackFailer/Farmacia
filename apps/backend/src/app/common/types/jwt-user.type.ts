import { UserRole } from '../enums/role.enum';

export type JwtUser = {
  sub: number;
  nombre: string;
  rol: UserRole;
};
