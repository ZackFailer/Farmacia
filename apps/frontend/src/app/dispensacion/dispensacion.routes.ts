import type { Route } from '@angular/router';
import { pasoGuard } from './guards/paso.guard';

export const dispensacionRoutes: Route[] = [
  {
    path: 'paso1',
    loadComponent: () => import('./pages/paso1-escanear-paciente.page').then(m => m.Paso1EscanearPacientePage),
  },
  {
    path: 'paso2',
    canActivate: [pasoGuard],
    loadComponent: () => import('./pages/paso2-seleccionar-meds.page').then(m => m.Paso2SeleccionarMedsPage),
  },
  {
    path: 'paso3',
    canActivate: [pasoGuard],
    loadComponent: () => import('./pages/paso3-confirmar.page').then(m => m.Paso3ConfirmarPage),
  },
  { path: '', redirectTo: 'paso1', pathMatch: 'full' },
];
