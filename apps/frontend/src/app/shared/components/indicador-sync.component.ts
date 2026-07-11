import { Component, inject, signal } from '@angular/core';
import {
  IonChip, IonIcon, IonLabel, IonToast, IonBadge,
  ActionSheetController, ModalController,
} from '@ionic/angular/standalone';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { SyncQueueService } from '../../core/services/sync-queue.service';
import { SyncDetailsModal } from './sync-details.modal';

@Component({
  standalone: true,
  selector: 'app-indicador-sync',
  imports: [IonChip, IonIcon, IonLabel, IonToast, IonBadge],
  template: `
    @if (showIndicator()) {
      <ion-chip
        [color]="chipColor()"
        [outline]="true"
        (click)="onChipClick()"
        class="sync-chip"
      >
        <ion-icon [name]="chipIcon()"></ion-icon>
        <ion-label>{{ chipText() }}</ion-label>
        @if (pendingCount > 0) {
          <ion-badge [color]="chipColor()" class="sync-badge">{{ pendingCount }}</ion-badge>
        }
      </ion-chip>
    }

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="4000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    .sync-chip {
      margin: 0;
      font-size: var(--app-font-size-xs);
      cursor: pointer;
      position: relative;
    }
    .sync-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 10px;
      --padding-top: 2px;
      --padding-bottom: 2px;
      --padding-start: 4px;
      --padding-end: 4px;
      min-width: 16px;
      min-height: 16px;
    }
  `],
})
export class IndicadorSyncComponent {
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly modalCtrl = inject(ModalController);

  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  private isSyncing = false;
  private lastResultTimestamp = 0;

  constructor() {
    import('@angular/core').then(() => {
      setInterval(() => {
        const result = this.syncQueue.lastSyncResult();
        const ts = result?.timestamp.getTime() ?? 0;
        if (result && ts > this.lastResultTimestamp && result.total > 0) {
          this.lastResultTimestamp = ts;
          if (result.synced > 0) {
            this.showToastMessage(`${result.synced} registro(s) sincronizado(s) automáticamente.`, 'success');
          }
          if (result.failed > 0) {
            this.showToastMessage(`${result.failed} registro(s) no pudieron sincronizarse.`, 'danger');
          }
        }
      }, 2000);
    });
  }

  get isOnline(): boolean {
    return this.connectivity.isOnline();
  }

  get pendingCount(): number {
    return this.syncQueue.pendingCount();
  }

  get failedCount(): number {
    return this.syncQueue.failedItemsCount();
  }

  showIndicator(): boolean {
    return !this.isOnline || this.pendingCount > 0 || this.failedCount > 0;
  }

  chipColor(): string {
    if (this.failedCount > 0) return 'danger';
    if (!this.isOnline) return 'warning';
    return 'primary';
  }

  chipIcon(): string {
    if (!this.isOnline) return 'cloud-offline-outline';
    if (this.failedCount > 0) return 'alert-circle-outline';
    return 'cloud-upload-outline';
  }

  chipText(): string {
    if (!this.isOnline) return 'Sin conexión';
    if (this.failedCount > 0) return `${this.failedCount} fallaron`;
    return `${this.pendingCount} pendientes`;
  }

  async onChipClick(): Promise<void> {
    const buttons: { text: string; role?: string; handler?: () => void | Promise<void> }[] = [];

    if (this.pendingCount > 0 && this.isOnline) {
      buttons.push({
        text: 'Forzar sincronización ahora',
        handler: () => this.forceSync(),
      });
    }

    if (this.failedCount > 0) {
      buttons.push({
        text: `Reintentar ${this.failedCount} fallidos`,
        handler: () => this.retryAllFailed(),
      });
    }

    if (this.pendingCount > 0 || this.failedCount > 0) {
      buttons.push({
        text: 'Ver detalles de pendientes',
        handler: () => this.showDetails(),
      });
    }

    if (!this.isOnline) {
      buttons.push({
        text: 'Sin conexión — toque para reintentar',
        handler: () => this.forceSync(),
      });
    }

    buttons.push({
      text: 'Cerrar',
      role: 'cancel',
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: this.buildHeader(),
      buttons,
    });
    await actionSheet.present();
  }

  private buildHeader(): string {
    const parts: string[] = [];
    if (!this.isOnline) parts.push('Sin conexión');
    if (this.pendingCount > 0) parts.push(`${this.pendingCount} pendiente(s)`);
    if (this.failedCount > 0) parts.push(`${this.failedCount} fallido(s)`);
    return parts.join(' · ');
  }

  private async forceSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;
    const result = await this.syncQueue.processQueue();
    this.isSyncing = false;
    if (result.synced > 0) {
      this.showToastMessage(`${result.synced} registro(s) sincronizado(s).`, 'success');
    }
    if (result.failed > 0) {
      this.showToastMessage(`${result.failed} registro(s) no pudieron sincronizarse.`, 'danger');
    }
  }

  private async retryAllFailed(): Promise<void> {
    const failed = this.syncQueue.getFailed();
    let retried = 0;
    let stillFailed = 0;
    for (const item of failed) {
      const ok = await this.syncQueue.retryFailed(item.id);
      if (ok) retried++;
      else stillFailed++;
    }
    if (retried > 0) {
      this.showToastMessage(`${retried} registro(s) recuperado(s).`, 'success');
    }
    if (stillFailed > 0) {
      this.showToastMessage(`${stillFailed} registro(s) siguen fallando.`, 'danger');
    }
  }

  private async showDetails(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: SyncDetailsModal,
    });
    await modal.present();
  }

  private showToastMessage(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }
}

