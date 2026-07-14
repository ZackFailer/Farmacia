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
    path: 'pacientes',
    canActivate: [roleGuard([Rol.RECEPTIONIST, Rol.DOCTOR, Rol.PHARMACEUTICAL, Rol.ADMIN, Rol.SURVEYOR])],
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
    loadChildren: () => import('./administracion/administracion.routes').then(m => m.administracionRoutes),
  },
  {
    path: 'censo',
    canActivate: [roleGuard([Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN])],
    loadChildren: () => import('./censo/censo.routes').then(m => m.censoRoutes),
  },
  {
    path: 'medicamentos',
    canActivate: [roleGuard([Rol.PHARMACEUTICAL, Rol.MEDICATION_RECEPTIONIST, Rol.DOCTOR, Rol.ADMIN])],
    loadChildren: () => import('./medicamentos/medicamentos.routes').then(m => m.medicamentosRoutes),
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
