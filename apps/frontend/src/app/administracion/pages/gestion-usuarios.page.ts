import { Component, OnInit, signal, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonToast, IonIcon,
  ModalController, AlertController,
} from '@ionic/angular/standalone';
import { AdministracionService } from '../services/administracion.service';
import { CrearEditarUsuarioModal } from '../modals/crear-editar-usuario.modal';
import type { Usuario } from '../../shared/models/usuario.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonNote, IonButton, IonSpinner, IonToast, IonIcon,
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
      <p class="page-subtitle">Administrar usuarios del sistema y sus permisos operativos.</p>
      <ion-button expand="block" (click)="crearUsuario()">+ Nuevo Usuario</ion-button>

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
          <ion-item>
            <ion-label>
              <h2>{{ u.nombre }}</h2>
              <ion-note>{{ u.rol === 'farmaceutico' ? 'Farmacéutico' : 'Despachador' }}</ion-note>
            </ion-label>
            <ion-button slot="end" fill="clear" (click)="editarUsuario(u)">Editar</ion-button>
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
})
export class GestionUsuariosPage implements OnInit {
  private adminService = inject(AdministracionService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal('success');

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private cargarUsuarios(): void {
    this.cargando.set(true);
    this.errorMsg.set('');
    this.adminService.getUsuarios().subscribe({
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
      message: `¿Eliminar a <strong>${u.nombre}</strong>?`,
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

  private mostrarExito(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('success'); this.showToast.set(true);
  }
  private mostrarError(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('danger'); this.showToast.set(true);
  }
}
