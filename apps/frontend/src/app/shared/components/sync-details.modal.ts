import { Component, signal, inject } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonIcon,
  IonFooter, IonItemGroup, IonItemDivider, IonNote,
  ModalController,
} from '@ionic/angular/standalone';
import { SyncQueueService, SyncQueueItem, SyncOperationType } from '../../core/services/sync-queue.service';

@Component({
  standalone: true,
  selector: 'app-sync-details',
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonIcon,
    IonFooter, IonItemGroup, IonItemDivider, IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalles de sincronización</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (pending().length === 0 && failed().length === 0) {
        <div class="app-empty">
          <ion-icon name="checkmark-circle-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin pendientes</h3>
          <p>No hay operaciones pendientes de sincronización.</p>
        </div>
      }

      @if (pending(); as items) {
        @if (items.length > 0) {
          <ion-item-group>
            <ion-item-divider color="warning" sticky="true">
              <ion-label>Pendientes ({{ items.length }})</ion-label>
            </ion-item-divider>
            @for (item of items; track item.id) {
              <ion-item>
                <ion-icon slot="start" [name]="getIcon(item.type)" color="warning"></ion-icon>
                <ion-label>
                  <h2>{{ item.metadata?.descripcion ?? item.type }}</h2>
                  <p class="item-endpoint">{{ item.endpoint }}</p>
                  <ion-note>Intentos: {{ item.retries }}/{{ item.maxRetries }}</ion-note>
                </ion-label>
              </ion-item>
            }
          </ion-item-group>
        }
      }

      @if (failed(); as items) {
        @if (items.length > 0) {
          <ion-item-group>
            <ion-item-divider color="danger" sticky="true">
              <ion-label>Fallidos ({{ items.length }})</ion-label>
            </ion-item-divider>
            @for (item of items; track item.id) {
              <ion-item>
                <ion-icon slot="start" [name]="getIcon(item.type)" color="danger"></ion-icon>
                <ion-label>
                  <h2>{{ item.metadata?.descripcion ?? item.type }}</h2>
                  <p class="item-error">{{ item.errorMessage }}</p>
                  <ion-note>{{ item.endpoint }}</ion-note>
                </ion-label>
                <ion-button slot="end" fill="clear" color="primary" (click)="retry($event, item)">
                  <ion-icon name="refresh-outline"></ion-icon>
                </ion-button>
              </ion-item>
            }
          </ion-item-group>
        }
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="dismiss()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .app-empty {
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
    ion-item h2 {
      font-size: var(--app-font-size-md);
      font-weight: 600;
      color: var(--app-text);
      margin-bottom: var(--app-space-xs);
    }
    .item-endpoint {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      margin: var(--app-space-xs) 0;
      font-family: monospace;
    }
    .item-error {
      font-size: var(--app-font-size-sm);
      color: var(--app-error, #dc3545);
      margin: var(--app-space-xs) 0;
    }
    ion-item-divider {
      margin-bottom: var(--app-space-xs);
    }
  `],
})
export class SyncDetailsModal {
  pending = signal<SyncQueueItem[]>([]);
  failed = signal<SyncQueueItem[]>([]);

  private readonly syncQueue = inject(SyncQueueService);
  private readonly modalCtrl = inject(ModalController);

  constructor() {
    this.refresh();
  }

  getIcon(type: SyncOperationType): string {
    if (type.includes('CREATE_CARPA') || type.includes('UPDATE_CARPA')) return 'home-outline';
    if (type.includes('DELETE_CARPA')) return 'trash-outline';
    if (type.includes('CREATE_PATIENT') || type.includes('UPDATE_PATIENT')) return 'person-outline';
    if (type.includes('DELETE_PATIENT')) return 'person-remove-outline';
    if (type === 'ADD_MEMBER_CARPA') return 'people-outline';
    if (type === 'MARK_NEED_SUPLIDA') return 'medkit-outline';
    return 'document-outline';
  }

  async retry(event: Event, item: SyncQueueItem): Promise<void> {
    event.stopPropagation();
    await this.syncQueue.retryFailed(item.id);
    this.refresh();
  }

  private refresh(): void {
    this.pending.set(this.syncQueue.getPending());
    this.failed.set(this.syncQueue.getFailed());
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}
