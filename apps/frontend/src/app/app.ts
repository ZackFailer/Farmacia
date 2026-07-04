import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  MenuController,
} from '@ionic/angular/standalone';
import { AuthService } from './auth/services/auth.service';

interface MenuItem {
  ruta: string;
  label: string;
  icon: string;
  activePrefix: string;
}

@Component({
  standalone: true,
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader,
    IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonIcon, IonButton,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  readonly menuItems: MenuItem[] = [
    { ruta: '/recepcion', label: 'Recepción', icon: 'download-outline', activePrefix: '/recepcion' },
    { ruta: '/inventario', label: 'Inventario', icon: 'cube-outline', activePrefix: '/inventario' },
    { ruta: '/inventario/umbrales', label: 'Umbrales', icon: 'settings-outline', activePrefix: '/inventario/umbrales' },
    { ruta: '/dispensacion/paso1', label: 'Dispensación', icon: 'medkit-outline', activePrefix: '/dispensacion' },
    { ruta: '/admin/usuarios', label: 'Admin', icon: 'people-outline', activePrefix: '/admin' },
  ];

  isActive(item: MenuItem): boolean {
    const current = this.router.url;
    if (item.activePrefix === '/inventario') {
      return current === '/inventario';
    }
    return current.startsWith(item.activePrefix);
  }

  navegar(ruta: string): void {
    this.menuCtrl.close();
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    this.menuCtrl.close();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
