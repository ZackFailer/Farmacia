import type { Route } from '@angular/router';

export const recetasRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/recetar.page').then(m => m.RecetarPage),
  },
];
