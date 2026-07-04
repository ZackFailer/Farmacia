import type { Route } from '@angular/router';

export const administracionRoutes: Route[] = [
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/gestion-usuarios.page').then(m => m.GestionUsuariosPage),
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion-general.page').then(m => m.ConfiguracionGeneralPage),
  },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];
