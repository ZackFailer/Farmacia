import type { Route } from '@angular/router';

export const medicamentosRoutes: Route[] = [
  {
    path: 'estadisticas',
    loadComponent: () => import('./pages/estadisticas-medicamentos.page').then(m => m.EstadisticasMedicamentosPage),
  },
  { path: '**', redirectTo: 'estadisticas' },
];
