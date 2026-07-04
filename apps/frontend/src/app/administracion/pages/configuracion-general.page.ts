import { Component, OnInit, signal, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonItem, IonLabel, IonButton, IonSpinner, IonToast,
  ModalController,
} from '@ionic/angular/standalone';
import { AdministracionService } from '../services/administracion.service';
import { LimitesDosisModal } from '../modals/limites-dosis.modal';
import type { Configuracion } from '../../shared/models/configuracion.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
    IonItem, IonLabel, IonButton, IonSpinner, IonToast,
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
      @if (cargando()) {
        <div class="app-loading"><ion-spinner></ion-spinner><p>Cargando...</p></div>
      } @else {
        <h3>Umbrales de Stock</h3>
        @for (c of configuraciones(); track c.id) {
          <ion-item>
            <ion-label>
              <h2>{{ c.medicamento?.nombre_generico ?? '—' }}</h2>
              <p>Umbral mínimo: <strong>{{ c.umbral_minimo }} unds</strong></p>
            </ion-label>
          </ion-item>
        }

        <h3 style="margin-top: var(--app-space-xl);">Límites de Dosis</h3>
        @for (c of configuraciones(); track c.id) {
          <ion-item>
            <ion-label>
              <h2>{{ c.medicamento?.nombre_generico ?? '—' }}</h2>
              @if (c.dosis_maxima_mg_kg !== undefined && c.dosis_maxima_mg_kg !== null) {
                <p>Dosis máx: {{ c.dosis_maxima_mg_kg }} mg/kg | Peso ref: {{ c.peso_referencia_kg ?? '—' }} kg</p>
              } @else {
                <p><em>Sin límite configurado</em></p>
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
export class ConfiguracionGeneralPage implements OnInit {
  private adminService = inject(AdministracionService);
  private modalCtrl = inject(ModalController);

  configuraciones = signal<Configuracion[]>([]);
  cargando = signal(true);
  showToast = signal(false);
  toastMsg = signal('');
  toastColor = signal('success');

  ngOnInit(): void {
    this.cargarConfiguraciones();
  }

  private cargarConfiguraciones(): void {
    this.adminService.getConfiguraciones().subscribe({
      next: (c) => { this.configuraciones.set(c); this.cargando.set(false); },
      error: () => { this.cargando.set(false); this.mostrarError('Error al cargar configuraciones'); },
    });
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
