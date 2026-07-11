import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonSpinner,
  IonList, IonNote, IonIcon, IonMenuButton, IonChip,
  IonFab, IonFabButton, IonToast, IonItemDivider,
  ModalController,
} from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { SyncQueueService, SyncOperationType } from '../../core/services/sync-queue.service';
import { PendingCarpaStore, type PendingCarpa } from '../../core/services/pending-carpa-store.service';
import { CrearCarpaModal } from '../modals/crear-carpa.modal';
import type { NucleoFamiliar } from '../../shared/models/nucleo-familiar.model';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonSpinner,
    IonList, IonNote, IonIcon, IonMenuButton, IonChip,
    IonFab, IonFabButton, IonToast, IonItemDivider,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Carpas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div style="text-align: center;">
        <h2>Carpas</h2>
      </div>
      <p class="app-text-secondary" style="text-align:center;font-size:var(--app-font-size-sm);margin:0 0 var(--app-space-lg);">Lista de carpas censales registradas. Seleccione una para ver sus integrantes o agregue nuevos.</p>

      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando carpas...</p>
        </div>
      }

      @if (error(); as errMsg) {
        @if (pendingCarpas().length > 0) {
          <div class="sync-banner" style="background:var(--app-warning-bg);color:var(--app-warning);">
            <ion-icon name="cloud-offline-outline"></ion-icon>
            <span>Sin conexión. Mostrando carpas pendientes de sincronizar.</span>
          </div>
        } @else {
          <div class="app-error-state">
            <ion-icon name="cloud-offline-outline"></ion-icon>
            <p>{{ errMsg }}</p>
            <ion-button fill="outline" (click)="cargar()">Reintentar</ion-button>
          </div>
        }
      }

      @if (pendingCarpas(); as pendings) {
        @if (pendings.length > 0) {
          <div class="sync-banner">
            <ion-icon name="cloud-upload-outline"></ion-icon>
            <span>Carpas pendientes de sincronizar: {{ pendings.length }}</span>
          </div>
          <ion-list>
            <ion-item-divider color="warning">
              <ion-label>Pendientes de sincronizar</ion-label>
            </ion-item-divider>
            @for (carpa of pendings; track carpa.tempCodigo) {
              <ion-item button (click)="verDetallePendiente(carpa)">
                <ion-label>
                  <h2>{{ carpa.tempCodigo }}</h2>
                  @if (carpa.ubicacion) {
                    <p>Ubicación: {{ carpa.ubicacion }}</p>
                  }
                  <ion-note>Creada: {{ carpa.createdAt | date:'dd/MM/yyyy HH:mm' }}</ion-note>
                </ion-label>
                <ion-chip color="warning" slot="end" outline="true">
                  <ion-icon name="time-outline"></ion-icon>
                  <ion-label>Pendiente</ion-label>
                </ion-chip>
              </ion-item>
            }
          </ion-list>
        }
      }

      @if (!cargando() && !error() && carpas(); as list) {
        @if (list.length === 0 && pendingCarpas().length === 0) {
          <div class="app-empty">
            <ion-icon name="home-outline" class="app-empty-icon"></ion-icon>
            <h3>Sin carpas registradas</h3>
            <p>No hay carpas censales registradas. Crea una nueva carpa para comenzar.</p>
          </div>
        } @else if (list.length > 0) {
          <ion-list>
            @for (carpa of list; track carpa.id) {
              <ion-item button (click)="verDetalle(carpa)">
                <ion-label>
                  <h2>{{ carpa.codigoCarpa }}</h2>
                  @if (carpa.ubicacion) {
                    <p>Ubicación: {{ carpa.ubicacion }}</p>
                  }
                  <ion-note>
                    @if (carpa.miembros) {
                      {{ carpa.miembros.length }} miembro{{ carpa.miembros.length !== 1 ? 's' : '' }}
                    }
                    @if (carpa.createdAt) {
                      · Creada: {{ carpa.createdAt | date:'dd/MM/yyyy' }}
                    }
                  </ion-note>
                </ion-label>
                <ion-button slot="end" fill="clear" (click)="editarUbicacion($event, carpa)">
                  <ion-icon name="create-outline"></ion-icon>
                </ion-button>
                <ion-button slot="end" fill="clear" color="danger" (click)="confirmarEliminar($event, carpa)">
                  <ion-icon name="trash-outline"></ion-icon>
                </ion-button>
              </ion-item>
            }
          </ion-list>
        }
      }
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="primary" (click)="crearCarpa()">
        <ion-icon name="add-outline"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    ion-list {
      padding: 0;
      background: transparent;
    }

    ion-item h2 {
      font-size: var(--app-font-size-md);
      font-weight: 600;
      color: var(--app-text);
      margin-bottom: var(--app-space-xs);
    }

    ion-item p {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      margin: var(--app-space-xs) 0;
    }

    .sync-banner {
      display: flex;
      align-items: center;
      gap: var(--app-space-sm);
      padding: var(--app-space-sm) var(--app-space-md);
      margin-bottom: var(--app-space-md);
      background: var(--app-warning-bg, #fff3cd);
      border-radius: var(--app-radius-sm, 6px);
      font-size: var(--app-font-size-sm);
      color: var(--app-warning, #856404);
    }

    .sync-banner ion-icon {
      font-size: 20px;
      flex-shrink: 0;
    }
  `],
})
export class ListarCarpasPage {
  cargando = signal(true);
  error = signal('');
  carpas = signal<NucleoFamiliar[]>([]);
  pendingCarpas = signal<PendingCarpa[]>([]);
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  private readonly router = inject(Router);
  private readonly pacientesService = inject(PacientesService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);
  private readonly pendingCarpaStore = inject(PendingCarpaStore);
  private readonly modalCtrl = inject(ModalController);

  pendingCount = computed(() => this.syncQueue.pendingCount());

  constructor() {
    this.cargar();
  }

  ionViewWillEnter(): void {
    this.loadPendingCarpas();
  }

  private loadPendingCarpas(): void {
    this.pendingCarpas.set(this.pendingCarpaStore.getAll());
  }

  verDetallePendiente(carpa: PendingCarpa): void {
    this.router.navigate(['/censo/carpa', carpa.tempCodigo]);
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.carpas.set([]);
    this.loadPendingCarpas();

    this.pacientesService.listarCarpasConMiembros().subscribe({
      next: (data) => {
        this.carpas.set(data);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(this.getErrorMessage(err, 'No se pudieron cargar las carpas.'));
      },
    });
  }

  verDetalle(carpa: NucleoFamiliar): void {
    if (carpa.codigoCarpa) {
      this.router.navigate(['/censo/carpa', carpa.codigoCarpa]);
    }
  }

  async crearCarpa(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CrearCarpaModal,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.success) {
      if (data?.offline) {
        this.presentToast('Carpa guardada sin conexión. Se sincronizará automáticamente.', 'warning');
      } else {
        this.presentToast('Carpa creada exitosamente.', 'success');
      }
      this.cargar();
    }
  }

  editarUbicacion(event: Event, carpa: NucleoFamiliar): void {
    event.stopPropagation();
    const nuevaUbicacion = prompt('Nueva ubicación:', carpa.ubicacion ?? '');
    if (nuevaUbicacion !== null && carpa.codigoCarpa) {
      this.pacientesService.actualizarCarpa(carpa.codigoCarpa, { ubicacion: nuevaUbicacion || undefined }).subscribe({
        next: () => {
          this.presentToast('Ubicación actualizada.', 'success');
          this.cargar();
        },
        error: (err: unknown) => {
          if (this.connectivity.isNetworkError(err)) {
            this.syncQueue.enqueue({
              type: SyncOperationType.UPDATE_CARPA,
              endpoint: `/censo/carpas/${encodeURIComponent(carpa.codigoCarpa!)}`,
              method: 'PATCH',
              body: { ubicacion: nuevaUbicacion || undefined },
              metadata: { descripcion: `Actualizar ubicación carpa ${carpa.codigoCarpa}` },
            });
            this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
            return;
          }
          this.presentToast('No se pudo actualizar la ubicación.', 'danger');
        },
      });
    }
  }

  confirmarEliminar(event: Event, carpa: NucleoFamiliar): void {
    event.stopPropagation();
    const confirmacion = confirm(`¿Está seguro de eliminar la carpa ${carpa.codigoCarpa}?`);
    if (confirmacion && carpa.codigoCarpa) {
      this.pacientesService.eliminarCarpa(carpa.codigoCarpa).subscribe({
        next: () => {
          this.presentToast('Carpa eliminada.', 'success');
          this.cargar();
        },
        error: (err: unknown) => {
          if (this.connectivity.isNetworkError(err)) {
            this.syncQueue.enqueue({
              type: SyncOperationType.DELETE_CARPA,
              endpoint: `/censo/carpas/${encodeURIComponent(carpa.codigoCarpa!)}`,
              method: 'DELETE',
              body: null,
              metadata: { descripcion: `Eliminar carpa ${carpa.codigoCarpa}` },
            });
            this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
            return;
          }
          this.presentToast('No se pudo eliminar la carpa.', 'danger');
        },
      });
    }
  }

  private presentToast(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        typeof error.error?.message === 'string'
          ? error.error.message
          : Array.isArray(error.error?.message)
            ? error.error.message.join(' · ')
            : null;
      return backendMessage ?? fallback;
    }
    return fallback;
  }
}
