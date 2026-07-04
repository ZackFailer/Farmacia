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
  IonFooter,
  IonButtons,
  IonButton,
  MenuController,
} from '@ionic/angular/standalone';
import { AuthService } from './auth/services/auth.service';

@Component({
  standalone: true,
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader,
    IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonIcon, IonFooter, IonButton,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);

  readonly menuItems = [
    { ruta: '/recepcion', label: 'Recepción', icon: 'download-outline' },
    { ruta: '/inventario', label: 'Inventario', icon: 'cube-outline' },
    { ruta: '/inventario/umbrales', label: 'Umbrales', icon: 'settings-outline' },
    { ruta: '/dispensacion/paso1', label: 'Dispensación', icon: 'medkit-outline' },
    { ruta: '/admin/usuarios', label: 'Admin', icon: 'people-outline' },
  ];

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
