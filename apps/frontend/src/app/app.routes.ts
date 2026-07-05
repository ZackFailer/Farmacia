import type { Route } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './shared/enums/rol.enum';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login.page').then(m => m.LoginPage),
  },
  {
    path: 'recepcion',
    canActivate: [roleGuard([Rol.MEDICATION_RECEPTIONIST, Rol.ADMIN])],
    loadChildren: () => import('./recepcion/recepcion.routes').then(m => m.recepcionRoutes),
  },
  {
    path: 'inventario',
    canActivate: [roleGuard([Rol.MEDICATION_RECEPTIONIST, Rol.PHARMACEUTICAL, Rol.ADMIN])],
    loadChildren: () => import('./inventario/inventario.routes').then(m => m.inventarioRoutes),
  },
  {
    path: 'pacientes',
    canActivate: [roleGuard([Rol.RECEPTIONIST, Rol.DOCTOR, Rol.PHARMACEUTICAL, Rol.ADMIN])],
    loadChildren: () => import('./pacientes/pacientes.routes').then(m => m.pacientesRoutes),
  },
  {
    path: 'recetas',
    canActivate: [roleGuard([Rol.DOCTOR, Rol.ADMIN])],
    loadChildren: () => import('./recetas/recetas.routes').then(m => m.recetasRoutes),
  },
  {
    path: 'dispensacion',
    canActivate: [roleGuard([Rol.PHARMACEUTICAL, Rol.ADMIN])],
    loadChildren: () => import('./dispensacion/dispensacion.routes').then(m => m.dispensacionRoutes),
  },
  {
    path: 'historial',
    canActivate: [roleGuard([Rol.DOCTOR, Rol.PHARMACEUTICAL, Rol.ADMIN])],
    loadChildren: () => import('./historial/historial.routes').then(m => m.historialRoutes),
  },
  {
    path: 'admin',
    canActivate: [roleGuard([Rol.ADMIN])],
    loadChildren: () => import('./administracion/administracion.routes').then(m => m.administracionRoutes),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
