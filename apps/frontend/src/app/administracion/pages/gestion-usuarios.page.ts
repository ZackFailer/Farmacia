import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonToast, IonIcon,
  IonToggle,
  IonRefresher, IonRefresherContent, ModalController, AlertController, ViewWillEnter,
} from '@ionic/angular/standalone';
import { AdministracionService } from '../services/administracion.service';
import { ROL_LABELS } from '../../shared/enums/rol.enum';
import { CrearEditarUsuarioModal } from '../modals/crear-editar-usuario.modal';
import type { Usuario } from '../../shared/models/usuario.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonToast, IonIcon,
    IonToggle,
    IonRefresher, IonRefresherContent, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Usuarios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <p class="page-subtitle">Administrar usuarios del sistema y sus permisos operativos.</p>

      <ion-button expand="block" (click)="crearUsuario()">+ Nuevo Usuario</ion-button>

      <ion-item>
        <ion-label>Ver inactivos</ion-label>
        <ion-toggle [(ngModel)]="verInactivos" (ionChange)="cargarUsuarios()"></ion-toggle>
      </ion-item>

      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando usuarios...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentarCarga()">Reintentar</ion-button>
        </div>
      } @else if (usuarios().length === 0) {
        <div class="app-empty">
          <ion-icon name="people-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin usuarios</h3>
          <p>No hay usuarios registrados en el sistema.</p>
        </div>
      } @else {
        @for (u of usuarios(); track u.id) {
          <ion-item [class.item-inactivo]="u.activo === false">
            <ion-label>
              <h2>{{ u.nombre }}</h2>
              <p>@{{ u.username }}</p>
              <ion-note>{{ rolLabels[u.rol] }}</ion-note>
              @if (u.activo === false) {
                <ion-note color="medium">Inactivo</ion-note>
              }
            </ion-label>
            <ion-button slot="end" fill="clear" (click)="editarUsuario(u)">Editar</ion-button>
            @if (u.activo === false) {
              <ion-button slot="end" fill="clear" color="success" (click)="reactivarUsuario(u)">
                <ion-icon name="refresh-outline" slot="icon-only"></ion-icon>
              </ion-button>
            }
            <ion-button slot="end" fill="clear" color="danger" (click)="eliminarUsuario(u)">Eliminar</ion-button>
          </ion-item>
        }
      }
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMsg()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    .item-inactivo { opacity: 0.5; }
  `],
})
export class GestionUsuariosPage implements ViewWillEnter {
  readonly rolLabels = ROL_LABELS;
  private adminService = inject(AdministracionService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal('success');
  verInactivos = signal(false);

  ionViewWillEnter(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.adminService.getUsuarios(this.verInactivos()).subscribe({
      next: (u) => { this.usuarios.set(u); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar los usuarios.');
        this.mostrarError('Error al cargar usuarios');
      },
    });
  }

  reintentarCarga(): void {
    this.cargarUsuarios();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargarUsuarios();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async crearUsuario(): Promise<void> {
    const modal = await this.modalCtrl.create({ component: CrearEditarUsuarioModal });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'crear' && data) {
      this.adminService.crearUsuario(data).subscribe({
        next: () => { this.cargarUsuarios(); this.mostrarExito('Usuario creado'); },
        error: (e) => this.mostrarError(e.message),
      });
    }
  }

  async editarUsuario(u: Usuario): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CrearEditarUsuarioModal,
      componentProps: { usuario: u },
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'editar' && data) {
      this.adminService.actualizarUsuario(u.id, data).subscribe({
        next: () => { this.cargarUsuarios(); this.mostrarExito('Usuario actualizado'); },
        error: (e) => this.mostrarError(e.message),
      });
    }
  }

  async eliminarUsuario(u: Usuario): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      message: `¿Eliminar permanentemente a <strong>${u.nombre}</strong>? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => {
          this.adminService.eliminarUsuario(u.id).subscribe({
            next: () => { this.cargarUsuarios(); this.mostrarExito('Usuario eliminado'); },
            error: (e) => this.mostrarError(e.message),
          });
        }},
      ],
    });
    alert.present();
  }

  async reactivarUsuario(u: Usuario): Promise<void> {
    this.adminService.actualizarUsuario(u.id, { activo: true }).subscribe({
      next: () => { this.cargarUsuarios(); this.mostrarExito('Usuario reactivado'); },
      error: (e) => this.mostrarError(e.message),
    });
  }

  private mostrarExito(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('success'); this.showToast.set(true);
  }
  private mostrarError(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('danger'); this.showToast.set(true);
  }
}
