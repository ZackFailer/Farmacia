import type { Route } from '@angular/router';

export const recepcionRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-ingresos.page').then(m => m.DashboardIngresosPage),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalogo-medicamentos.page').then(m => m.CatalogoMedicamentosPage),
  },
];
