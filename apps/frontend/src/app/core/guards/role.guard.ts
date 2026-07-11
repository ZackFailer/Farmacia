import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Rol } from '../../shared/enums/rol.enum';

const HOME_BY_ROLE: Record<Rol, string> = {
  [Rol.ADMIN]: '/admin',
  [Rol.DOCTOR]: '/recetas',
  [Rol.PHARMACEUTICAL]: '/dispensacion',
  [Rol.RECEPTIONIST]: '/pacientes',
  [Rol.MEDICATION_RECEPTIONIST]: '/recepcion',
  [Rol.SURVEYOR]: '/censo/carpas',
};

export function roleGuard(allowedRoles: Rol[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const usuario = authService.getUsuario();

    if (usuario && allowedRoles.includes(usuario.rol)) {
      return true;
    }

    if (usuario) {
      router.navigate([HOME_BY_ROLE[usuario.rol] ?? '/login']);
      return false;
    }

    router.navigate(['/login']);
    return false;
  };
}
