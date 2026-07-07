import type { Route } from '@angular/router';
import { pasoGuard } from './guards/paso.guard';

export const dispensacionRoutes: Route[] = [
  { path: 'cola', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    loadComponent: () => import('./pages/dispensacion.page').then(m => m.DispensacionPage),
  },
  {
    path: 'medicamentos',
    canActivate: [pasoGuard],
    loadComponent: () => import('./pages/seleccionar-medicamentos.page').then(m => m.SeleccionarMedicamentosPage),
  },
  {
    path: 'confirmacion',
    canActivate: [pasoGuard],
    loadComponent: () => import('./pages/confirmar-entrega.page').then(m => m.ConfirmarEntregaPage),
  },
];
