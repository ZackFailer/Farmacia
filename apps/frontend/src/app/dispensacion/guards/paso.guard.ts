import { Injectable, inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { DispensacionService } from '../services/dispensacion.service';

export const pasoGuard: CanActivateFn = (route) => {
  const service = inject(DispensacionService);
  const router = inject(Router);
  const estado = service.estado();

  const pasoRequerido = route.routeConfig?.path;
  if (pasoRequerido === 'paso2' && !estado.paciente) {
    router.navigate(['/dispensacion/paso1']);
    return false;
  }
  if (pasoRequerido === 'paso3' && (estado.items.length === 0 || !estado.paciente)) {
    router.navigate(['/dispensacion/paso1']);
    return false;
  }
  return true;
};
