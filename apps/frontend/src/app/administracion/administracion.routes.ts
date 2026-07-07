import type { Route } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { Rol } from '../shared/enums/rol.enum';

export const administracionRoutes: Route[] = [
  {
    path: 'usuarios',
    canActivate: [roleGuard([Rol.ADMIN])],
    loadComponent: () => import('./pages/gestion-usuarios.page').then(m => m.GestionUsuariosPage),
  },
  {
    path: 'configuracion',
    canActivate: [roleGuard([Rol.ADMIN])],
    loadComponent: () => import('./pages/configuracion-general.page').then(m => m.ConfiguracionGeneralPage),
  },
  {
    path: 'patologias',
    canActivate: [roleGuard([Rol.ADMIN, Rol.SURVEYOR])],
    loadComponent: () => import('../admin/pages/patologias.page').then(m => m.GestionPatologiasPage),
  },
  {
    path: 'necesidades',
    canActivate: [roleGuard([Rol.ADMIN, Rol.SURVEYOR])],
    loadComponent: () => import('../admin/pages/necesidades.page').then(m => m.GestionNecesidadesPage),
  },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
];
