import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login.page').then(m => m.LoginPage),
  },
  {
    path: 'recepcion',
    loadChildren: () => import('./recepcion/recepcion.routes').then(m => m.recepcionRoutes),
  },
  {
    path: 'inventario',
    loadChildren: () => import('./inventario/inventario.routes').then(m => m.inventarioRoutes),
  },
  {
    path: 'pacientes',
    loadChildren: () => import('./pacientes/pacientes.routes').then(m => m.pacientesRoutes),
  },
  {
    path: 'recetas',
    loadChildren: () => import('./recetas/recetas.routes').then(m => m.recetasRoutes),
  },
  {
    path: 'dispensacion',
    loadChildren: () => import('./dispensacion/dispensacion.routes').then(m => m.dispensacionRoutes),
  },
  {
    path: 'historial/:pacienteId',
    loadChildren: () => import('./historial/historial.routes').then(m => m.historialRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./administracion/administracion.routes').then(m => m.administracionRoutes),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
