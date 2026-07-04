import type { Route } from '@angular/router';

export const pacientesRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/lista-pacientes.page').then(m => m.ListaPacientesPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/detalle-paciente.page').then(m => m.DetallePacientePage),
  },
];
