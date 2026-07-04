import type { Route } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { Rol } from '../shared/enums/rol.enum';

export const administracionRoutes: Route[] = [
  {
    path: 'usuarios',
    canActivate: [roleGuard([Rol.FARMACEUTICO])],
    loadComponent: () => import('./pages/gestion-usuarios.page').then(m => m.GestionUsuariosPage),
  },
  {
    path: 'configuracion',
    canActivate: [roleGuard([Rol.FARMACEUTICO])],
    loadComponent: () => import('./pages/configuracion-general.page').then(m => m.ConfiguracionGeneralPage),
  },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];
