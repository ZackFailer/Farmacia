import type { Route } from '@angular/router';

export const recepcionRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/catalogo-medicamentos.page').then(m => m.CatalogoMedicamentosPage),
  },
];
