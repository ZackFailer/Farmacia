import { Component, inject, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonIcon, IonSpinner, IonList,
  IonMenuButton, IonFab, IonFabButton,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { AdministracionService } from '../../administracion/services/administracion.service';
import type { Patologia } from '../../shared/models/patologia.model';
import { CrearPatologiaModal } from '../modals/crear-patologia.modal';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonIcon, IonSpinner, IonList,
    IonMenuButton, IonFab, IonFabButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Patologías</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando...</p>
        </div>
      }

      @if (error()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ error() }}</p>
          <ion-button fill="outline" (click)="cargar()">Reintentar</ion-button>
        </div>
      }

      @if (!cargando() && !error() && items().length === 0) {
        <div class="app-empty">
          <ion-icon name="file-tray-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin patologías</h3>
          <p>No hay patologías registradas. Cree la primera.</p>
        </div>
      }

      @if (!cargando() && items().length > 0) {
        <ion-list>
          @for (item of items(); track item.id) {
            <ion-item>
              <ion-label>
                <h2>{{ item.nombre }}</h2>
                @if (item.descripcion) {
                  <p>{{ item.descripcion }}</p>
                }
              </ion-label>
              <ion-button slot="end" fill="clear" color="danger" (click)="eliminar(item.id)">
                <ion-icon name="trash-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="primary" (click)="crear()">
        <ion-icon name="add-outline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
  styles: [`
    .app-loading, .app-empty, .app-error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--app-space-2xl);
      text-align: center;
      min-height: 200px;
      color: var(--app-text-secondary);
    }
    .app-empty-icon {
      font-size: 64px;
      margin-bottom: var(--app-space-lg);
      color: var(--app-border);
    }
  `],
})
export class GestionPatologiasPage {
  private readonly adminService = inject(AdministracionService);
  private readonly modalCtrl = inject(ModalController);

  readonly items = signal<Patologia[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.adminService.getPatologias().subscribe({
      next: (res) => { this.items.set(res); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar patologías'); this.cargando.set(false); },
    });
  }

  async crear(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CrearPatologiaModal,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.adminService.crearPatologia(data).subscribe(() => this.cargar());
    }
  }

  eliminar(id: number): void {
    this.adminService.eliminarPatologia(id).subscribe(() => this.cargar());
  }
}
