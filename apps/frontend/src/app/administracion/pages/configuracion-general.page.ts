import { Component, signal, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonButton, IonSpinner, IonToast, IonIcon,
  IonRefresher, IonRefresherContent, ModalController, ViewWillEnter,
} from '@ionic/angular/standalone';
import { AdministracionService } from '../services/administracion.service';
import { LimitesDosisModal } from '../modals/limites-dosis.modal';
import type { Configuracion } from '../../shared/models/configuracion.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonButton, IonSpinner, IonToast, IonIcon,
    IonRefresher, IonRefresherContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Configuración</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="handleRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <p class="page-subtitle">Definir umbrales y limites de dosis para controles clinicos y de inventario.</p>
      @if (cargando()) {
        <div class="app-loading"><ion-spinner name="crescent"></ion-spinner><p>Cargando configuraciones...</p></div>
      } @else if (errorMsg()) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" (click)="reintentarCarga()">Reintentar</ion-button>
        </div>
      } @else if (configuraciones().length === 0) {
        <div class="app-empty">
          <ion-icon name="settings-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin configuraciones</h3>
          <p>No hay configuraciones clínicas registradas.</p>
        </div>
      } @else {
        <h3>Configuración por Medicamento</h3>
        @for (c of configuraciones(); track c.id) {
          <ion-item>
            <ion-label>
              <h2>{{ c.medicamento?.nombre_generico ?? '—' }}</h2>
              <p>Umbral mínimo: <strong>{{ c.umbral_minimo }} unds</strong></p>
              @if (c.dosis_maxima_mg_kg !== undefined && c.dosis_maxima_mg_kg !== null) {
                <p>Dosis máx: {{ c.dosis_maxima_mg_kg }} mg/kg | Peso ref: {{ c.peso_referencia_kg ?? '—' }} kg</p>
              } @else {
                <p><em>Sin límite de dosis configurado</em></p>
              }
            </ion-label>
            <ion-button slot="end" fill="outline" (click)="editarLimite(c)">Editar</ion-button>
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
export class ConfiguracionGeneralPage implements ViewWillEnter {
  private adminService = inject(AdministracionService);
  private modalCtrl = inject(ModalController);

  configuraciones = signal<Configuracion[]>([]);
  cargando = signal(true);
  errorMsg = signal('');
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal('success');

  ionViewWillEnter(): void {
    this.cargarConfiguraciones();
  }

  private cargarConfiguraciones(): void {
    this.errorMsg.set('');
    this.adminService.getConfiguraciones().subscribe({
      next: (c) => { this.configuraciones.set(c); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No fue posible cargar las configuraciones.');
        this.mostrarError('Error al cargar configuraciones');
      },
    });
  }

  reintentarCarga(): void {
    this.cargando.set(true);
    this.cargarConfiguraciones();
  }

  async handleRefresh(event: CustomEvent): Promise<void> {
    this.cargando.set(true);
    this.cargarConfiguraciones();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async editarLimite(config: Configuracion): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LimitesDosisModal,
      componentProps: { configuracion: config },
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.adminService.actualizarConfiguracion(config.id, data).subscribe({
        next: () => { this.cargarConfiguraciones(); this.mostrarExito('Configuración actualizada'); },
        error: (e) => this.mostrarError(e.message),
      });
    }
  }

  private mostrarExito(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('success'); this.showToast.set(true);
  }
  private mostrarError(msg: string): void {
    this.toastMsg.set(msg); this.toastColor.set('danger'); this.showToast.set(true);
  }
}
