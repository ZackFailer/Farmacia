import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import type { Rol } from '../../shared/enums/rol.enum';

export function roleGuard(allowedRoles: Rol[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const usuario = authService.getUsuario();

    if (usuario && allowedRoles.includes(usuario.rol)) {
      return true;
    }

    router.navigate(['/login']);
    return false;
  };
}
