import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { DispensacionService } from '../services/dispensacion.service';

export const pasoGuard: CanActivateFn = (route) => {
  const service = inject(DispensacionService);
  const router = inject(Router);
  const estado = service.estado();

  const pasoRequerido = route.routeConfig?.path;
  if (pasoRequerido === 'medicamentos' && !estado.paciente) {
    router.navigate(['/dispensacion']);
    return false;
  }
  if (pasoRequerido === 'confirmacion' && (estado.items.length === 0 || !estado.paciente)) {
    router.navigate(['/dispensacion']);
    return false;
  }
  return true;
};
