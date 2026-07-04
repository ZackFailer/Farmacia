import type { Route } from '@angular/router';

export const inventarioRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/panel-stock.page').then(m => m.PanelStockPage),
  },
  {
    path: 'umbrales',
    loadComponent: () => import('./pages/configurar-umbrales.page').then(m => m.ConfigurarUmbralesPage),
  },
];
