import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonIcon,
  IonFooter, IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { SyncQueueService, SyncOperationType } from '../../core/services/sync-queue.service';
import { PendingCarpaStore } from '../../core/services/pending-carpa-store.service';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonIcon,
    IonFooter, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Nueva Carpa</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (error()) {
        <p class="app-inline-error">{{ error() }}</p>
      }

      <ion-item>
        <ion-label position="stacked">Ubicaci&oacute;n *</ion-label>
        <ion-input
          [(ngModel)]="ubicacion"
          type="text"
          placeholder="Ej: Sector A, m&oacute;dulo 3"
        ></ion-input>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!ubicacion.trim() || guardando()">
            @if (guardando()) {
              <ion-spinner name="crescent" slot="start"></ion-spinner>
            }
            Guardar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .app-inline-error {
      color: var(--app-error, #dc3545);
      font-size: var(--app-font-size-sm, 0.875rem);
      margin: 0 0 var(--app-space-sm, 8px);
      padding: var(--app-space-sm, 8px);
      background: var(--app-error-bg, #ffebee);
      border-radius: var(--app-radius-sm, 6px);
    }
    ion-item {
      --border-radius: var(--app-radius-sm, 6px);
      --padding-start: var(--app-space-md, 12px);
      --padding-end: var(--app-space-md, 12px);
      margin-bottom: var(--app-space-md, 12px);
    }
  `],
})
export class CrearCarpaModal {
  ubicacion = '';
  guardando = signal(false);
  error = signal('');

  private readonly modalCtrl = inject(ModalController);
  private readonly pacientesService = inject(PacientesService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);
  private readonly pendingCarpaStore = inject(PendingCarpaStore);

  async guardar(): Promise<void> {
    if (!this.ubicacion.trim() || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');

    const dto = { ubicacion: this.ubicacion.trim() };

    try {
      await new Promise<void>((resolve, reject) => {
        this.pacientesService.crearCarpa(dto).subscribe({
          next: () => resolve(),
          error: (e: unknown) => reject(e),
        });
      });
      await this.modalCtrl.dismiss({ success: true }, 'confirm');
    } catch (err: unknown) {
      if (this.connectivity.isNetworkError(err)) {
        const tempCodigo = `PEND-${Date.now()}`;
        const tempId = -Date.now();
        this.syncQueue.enqueue({
          type: SyncOperationType.CREATE_CARPA,
          endpoint: '/censo/carpas',
          method: 'POST',
          body: dto,
          metadata: { descripcion: 'Crear carpa', tempId, tempCodigo },
        });
        this.pendingCarpaStore.add({
          tempCodigo,
          ubicacion: dto.ubicacion,
          createdAt: new Date().toISOString(),
        });
        await this.modalCtrl.dismiss({ success: true, offline: true }, 'confirm');
        return;
      }
      this.guardando.set(false);
      this.error.set('No se pudo crear la carpa. Verifica tu conexión e intenta de nuevo.');
    }
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
