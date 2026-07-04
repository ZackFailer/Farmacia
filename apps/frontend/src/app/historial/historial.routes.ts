import type { Route } from '@angular/router';

export const historialRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/historial-paciente.page').then(m => m.HistorialPacientePage),
  },
];
