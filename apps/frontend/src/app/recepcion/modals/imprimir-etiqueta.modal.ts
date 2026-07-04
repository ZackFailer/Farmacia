import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter, ModalController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import type { Lote } from '../../shared/models/lote.model';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonFooter, DatePipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Etiqueta de Lote</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="etiqueta" id="etiqueta-print">
        <div class="etiqueta-header">APOPHARMA</div>
        <div class="etiqueta-divider"></div>
        <div class="etiqueta-row">
          <span class="etiqueta-label">Medicamento:</span>
          <span class="etiqueta-value">{{ lote?.medicamento?.nombre_generico ?? '—' }} {{ lote?.medicamento?.concentracion }}{{ lote?.medicamento?.unidad_concentracion }}</span>
        </div>
        <div class="etiqueta-row">
          <span class="etiqueta-label">Lote:</span>
          <span class="etiqueta-value">{{ lote?.codigo_qr }}</span>
        </div>
        <div class="etiqueta-row">
          <span class="etiqueta-label">Vencimiento:</span>
          <span class="etiqueta-value">{{ lote?.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="etiqueta-row">
          <span class="etiqueta-label">Cantidad:</span>
          <span class="etiqueta-value">{{ lote?.cantidad_inicial }} unds</span>
        </div>
        @if (lote?.donante) {
          <div class="etiqueta-row">
            <span class="etiqueta-label">Donante:</span>
            <span class="etiqueta-value">{{ lote?.donante }}</span>
          </div>
        }
        <div class="etiqueta-divider"></div>
        <div class="etiqueta-qr-placeholder">
          <div class="qr-box">[QR: {{ lote?.codigo_qr?.slice(-8) }}]</div>
        </div>
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="imprimir()">Imprimir</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .etiqueta {
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-md);
      padding: var(--app-space-lg);
      background: white;
      max-width: 400px;
      margin: 0 auto;
    }
    .etiqueta-header {
      font-size: var(--app-font-size-lg);
      font-weight: 700;
      color: var(--app-primary);
      text-align: center;
      margin-bottom: var(--app-space-sm);
    }
    .etiqueta-divider {
      height: 1px;
      background: var(--app-divider);
      margin: var(--app-space-sm) 0;
    }
    .etiqueta-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: var(--app-font-size-sm);
    }
    .etiqueta-label { color: var(--app-text-secondary); font-weight: 500; }
    .etiqueta-value { color: var(--app-text); font-weight: 600; text-align: right; }
    .etiqueta-qr-placeholder {
      display: flex;
      justify-content: center;
      margin-top: var(--app-space-sm);
    }
    .qr-box {
      width: 120px;
      height: 120px;
      border: 2px dashed var(--app-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
    }
    @media print {
      ion-header, ion-footer { display: none !important; }
      .etiqueta { border: none; max-width: 100%; }
      .qr-box { border: 1px solid #000; }
    }
  `],
})
export class ImprimirEtiquetaModal {
  constructor(private modalCtrl: ModalController) {}

  @Input() lote!: Lote;

  imprimir() {
    window.print();
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }
}
