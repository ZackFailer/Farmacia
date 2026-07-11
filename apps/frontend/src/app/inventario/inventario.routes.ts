import type { Route } from '@angular/router';
import { roleGuard } from '../core/guards/role.guard';
import { Rol } from '../shared/enums/rol.enum';

export const inventarioRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-stock.page').then(m => m.PanelStockPage),
  },
  {
    path: 'metricas',
    loadComponent: () => import('./pages/metricas-inventario.page').then(m => m.MetricasInventarioPage),
  },
  {
    path: 'umbrales',
    canActivate: [roleGuard([Rol.ADMIN])],
    loadComponent: () => import('./pages/configurar-umbrales.page').then(m => m.ConfigurarUmbralesPage),
  },
];
