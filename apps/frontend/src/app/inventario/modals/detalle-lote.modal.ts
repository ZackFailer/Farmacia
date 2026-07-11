/**
 * @deprecated Lote functionality removed. Kept for historical reference only.
 */
import { Component, input, OnInit, signal, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonNote, IonList, IonFooter, ModalController } from '@ionic/angular/standalone';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FechaRelativaPipe } from '../../shared/pipes/fecha-relativa.pipe';
import type { Lote } from '../../shared/models/lote.model';
import type { Movimiento } from '../../shared/models/stock-item.model';
import QRCode from 'qrcode';

@Component({
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonNote, IonList, IonFooter, TitleCasePipe, DatePipe, FechaRelativaPipe],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalle de Lote</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label>
          <h2>{{ lote().medicamento?.nombre_generico }} {{ lote().medicamento?.concentracion }}{{ lote().medicamento?.unidad_concentracion }}</h2>
          <p>Stock: {{ lote().cantidad_actual }} / {{ lote().cantidad_inicial }} inicial</p>
          <ion-note>Vencimiento: {{ lote().fecha_vencimiento | date:'dd/MM/yyyy' }}</ion-note>
          @if (lote().donante) { <ion-note>Donante: {{ lote().donante }}</ion-note> }
          @if (lote().ubicacion) { <ion-note>Ubicación: {{ lote().ubicacion }}</ion-note> }
        </ion-label>
      </ion-item>

      @if (qrDataUrl()) {
        <div class="qr-section">
          <img [src]="qrDataUrl()" alt="QR del lote" class="qr-img" />
          <p class="qr-code">{{ lote().codigo_qr }}</p>
        </div>
      } @else {
        <div class="qr-section">
          <div class="qr-box">Generando QR...</div>
        </div>
      }

      <ion-list>
        @for (mov of movimientos; track mov.id) {
          <ion-item>
            <ion-label>
              <h3>{{ mov.tipo | titlecase }}</h3>
              <p>{{ mov.descripcion }}</p>
              <ion-note>{{ mov.fecha | fechaRelativa }}</ion-note>
            </ion-label>
            <ion-note slot="end" [style.color]="mov.cantidad > 0 ? 'var(--stock-ok)' : 'var(--stock-agotado)'">
              {{ mov.cantidad > 0 ? '+' : '' }}{{ mov.cantidad }}
            </ion-note>
          </ion-item>
        } @empty {
          <ion-item>
            <ion-label class="ion-text-center">Sin movimientos registrados</ion-label>
          </ion-item>
        }
      </ion-list>
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
    .qr-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--app-space-md) 0;
    }
    .qr-img {
      width: 160px;
      height: 160px;
      image-rendering: pixelated;
    }
    .qr-code {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      font-family: monospace;
      margin-top: var(--app-space-xs);
      word-break: break-all;
      text-align: center;
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
  `],
})
export class DetalleLoteModal implements OnInit {
  private readonly modalCtrl = inject(ModalController);

  readonly lote = input.required<Lote>();
  movimientos: Movimiento[] = [];
  qrDataUrl = signal<string | null>(null);

  async ngOnInit() {
    // @deprecated: lote functionality removed - movimientos no longer available
    this.movimientos = [];
    try {
      const url = await QRCode.toDataURL(this.lote().codigo_qr, {
        margin: 1,
        width: 280,
      });
      this.qrDataUrl.set(url);
    } catch {
      this.qrDataUrl.set(null);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
