import { Component, computed, inject } from '@angular/core';
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
  IonButtons,
  IonToast,
  MenuController,
} from '@ionic/angular/standalone';
import { AuthService } from './auth/services/auth.service';
import { IndicadorSyncComponent } from './shared/components/indicador-sync.component';
import { Rol, ROL_LABELS } from './shared/enums/rol.enum';
import { ToastService } from './shared/services/toast.service';

interface MenuItem {
  ruta: string;
  label: string;
  icon: string;
  activePrefix: string;
  roles: Rol[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { ruta: '/recepcion', label: 'Catálogo', icon: 'file-tray-stacked-outline', activePrefix: '/recepcion', roles: [Rol.MEDICATION_RECEPTIONIST, Rol.ADMIN] },
  { ruta: '/pacientes', label: 'Pacientes', icon: 'people-outline', activePrefix: '/pacientes', roles: [Rol.RECEPTIONIST, Rol.DOCTOR, Rol.ADMIN, Rol.SURVEYOR] },
  { ruta: '/recetas', label: 'Recetas', icon: 'document-text-outline', activePrefix: '/recetas', roles: [Rol.DOCTOR, Rol.ADMIN] },
  { ruta: '/dispensacion', label: 'Dispensación', icon: 'medkit-outline', activePrefix: '/dispensacion', roles: [Rol.PHARMACEUTICAL, Rol.ADMIN] },
  { ruta: '/historial', label: 'Historial', icon: 'time-outline', activePrefix: '/historial', roles: [Rol.DOCTOR, Rol.PHARMACEUTICAL, Rol.ADMIN] },
  { ruta: '/medicamentos/estadisticas', label: 'Estadísticas', icon: 'bar-chart-outline', activePrefix: '/medicamentos/estadisticas', roles: [Rol.PHARMACEUTICAL, Rol.MEDICATION_RECEPTIONIST, Rol.DOCTOR, Rol.ADMIN] },
  { ruta: '/censo/carpas', label: 'Censo - Carpas', icon: 'home-outline', activePrefix: '/censo/carpas', roles: [Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN] },
  { ruta: '/censo/tablero', label: 'Censo - Tablero', icon: 'stats-chart-outline', activePrefix: '/censo/tablero', roles: [Rol.SURVEYOR, Rol.RECEPTIONIST, Rol.ADMIN] },
  { ruta: '/admin/usuarios', label: 'Admin - Usuarios', icon: 'shield-outline', activePrefix: '/admin/usuarios', roles: [Rol.ADMIN] },
  { ruta: '/admin/configuracion', label: 'Admin - Configuración', icon: 'settings-outline', activePrefix: '/admin/configuracion', roles: [Rol.ADMIN] },
  { ruta: '/admin/patologias', label: 'Admin - Patologías', icon: 'pulse-outline', activePrefix: '/admin/patologias', roles: [Rol.ADMIN, Rol.SURVEYOR] },
  { ruta: '/admin/necesidades', label: 'Admin - Necesidades', icon: 'list-outline', activePrefix: '/admin/necesidades', roles: [Rol.ADMIN, Rol.SURVEYOR] },
];

@Component({
  standalone: true,
  imports: [
    IonApp, IonRouterOutlet, IonMenu, IonHeader,
    IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonIcon, IonButton, IonButtons, IonToast,
    IndicadorSyncComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  readonly rolLabels = ROL_LABELS;
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  readonly toast = inject(ToastService);

  readonly usuario = this.authService.usuario$;

  readonly menuItems = computed(() => {
    const usuario = this.authService.usuario$();
    if (!usuario) return [];
    return ALL_MENU_ITEMS.filter((item) => item.roles.includes(usuario.rol));
  });

  isActive(item: MenuItem): boolean {
    return this.router.url.startsWith(item.activePrefix);
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
