import type { Route } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { Rol } from '../shared/enums/rol.enum';

export const censoRoutes: Route[] = [
  {
    path: 'carpas',
    canActivate: [roleGuard([Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN])],
    loadComponent: () => import('./pages/listar-carpas.page').then(m => m.ListarCarpasPage),
  },
  {
    path: 'crear-carpa',
    canActivate: [roleGuard([Rol.SURVEYOR, Rol.ADMIN])],
    loadComponent: () => import('./pages/crear-carpa.page').then(m => m.CrearCarpaPage),
  },
  {
    path: 'tablero',
    canActivate: [roleGuard([Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN])],
    loadComponent: () => import('./pages/tablero.page').then(m => m.TableroPage),
  },
  {
    path: 'carpa/:codigo',
    canActivate: [roleGuard([Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN])],
    loadComponent: () => import('./pages/detalle-carpa.page').then(m => m.DetalleCarpaPage),
  },
  { path: '', redirectTo: 'carpas', pathMatch: 'full' },
];
