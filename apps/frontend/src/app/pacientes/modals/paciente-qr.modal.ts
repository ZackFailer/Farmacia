import { Component, Input } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  ModalController,
} from '@ionic/angular/standalone';
import QRCode from 'qrcode';

@Component({
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonFooter,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>QR del Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="qr-wrap">
        <h3>{{ nombre || 'Paciente' }}</h3>
        @if (idEmergencia) {
          <p>ID Emergencia: <strong>{{ idEmergencia }}</strong></p>
        } @else {
          <p class="qr-note">El ID de emergencia se asigna al guardar. Confirme para generar el QR definitivo.</p>
        }

        @if (qrDataUrl) {
          <img [src]="qrDataUrl" alt="QR paciente" class="qr-image" />
        }
      </div>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="cerrar()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .qr-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-space-md);
      text-align: center;
    }

    .qr-image {
      width: min(280px, 80vw);
      height: min(280px, 80vw);
      border-radius: var(--app-radius-md);
      border: 1px solid var(--app-border);
      background: var(--app-surface);
      padding: var(--app-space-sm);
    }

    .qr-note {
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
    }
  `],
})
export class PacienteQrModal {
  @Input() idEmergencia = '';
  @Input() nombre = '';

  qrDataUrl = '';

  constructor(private modalCtrl: ModalController) {}

  async ngOnInit(): Promise<void> {
    const contenido = this.idEmergencia || 'PENDIENTE-ASIGNACION-ID';
    this.qrDataUrl = await QRCode.toDataURL(contenido, {
      margin: 1,
      width: 280,
    });
  }

  cerrar(): void {
    this.modalCtrl.dismiss();
  }
}
