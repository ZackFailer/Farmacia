import { Component, Input, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonNote, IonFooter, ModalController } from '@ionic/angular/standalone';
import type { Lote } from '../../shared/models/lote.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonInput, IonNote, IonFooter, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Conteo Físico</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>{{ lote.medicamento?.nombre_generico }}</h2>
          <p>Lote: {{ lote.codigo_qr.slice(-8) }}</p>
          <ion-note>Stock actual: {{ lote.cantidad_actual }}</ion-note>
        </ion-label>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Cantidad real contada *</ion-label>
        <ion-input type="number" [(ngModel)]="cantidadReal" (ionInput)="calcularDiferencia()"></ion-input>
      </ion-item>

      @if (diferencia() !== null) {
        <ion-item lines="none">
          <ion-label>
            <p>Diferencia: <strong [style.color]="diferenciaColor">{{ (diferencia() ?? 0) > 0 ? '+' : '' }}{{ diferencia() }}</strong></p>
          </ion-label>
        </ion-item>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="ajustar()" [disabled]="cantidadReal === null || cantidadReal < 0">Ajustar Stock</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class AjusteStockModal {
  private readonly modalCtrl = inject(ModalController);

  @Input({ required: true }) lote!: Lote;

  cantidadReal: number | null = null;
  diferencia = signal<number | null>(null);

  calcularDiferencia() {
    if (this.cantidadReal === null || !this.lote) {
      this.diferencia.set(null);
      return;
    }
    this.diferencia.set(this.cantidadReal - this.lote.cantidad_actual);
  }

  get diferenciaColor(): string {
    const d = this.diferencia();
    if (d === null) return '';
    return d === 0 ? 'var(--app-text-secondary)' : d > 0 ? 'var(--stock-ok)' : 'var(--stock-agotado)';
  }

  ajustar() {
    this.modalCtrl.dismiss({ cantidad_real: this.cantidadReal ?? 0 });
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
