import { Component, Input, NgZone } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import QRCode from 'qrcode';
import { buildPacienteQrPayload, normalizePacienteQrId } from '../../shared/utils/paciente-qr.util';

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
    IonIcon,
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
        @if (telefono) {
          <p class="qr-note">Teléfono: {{ telefono }}</p>
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
        <ion-buttons slot="end">
          <ion-button
            fill="solid"
            color="primary"
            (click)="compartirWhatsApp()"
            [disabled]="!canCompartirWhatsapp()"
          >
            <ion-icon name="logo-whatsapp" slot="start"></ion-icon>
            Compartir por WhatsApp
          </ion-button>
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
  @Input() telefono = '';

  qrDataUrl = '';

  constructor(
    private modalCtrl: ModalController,
    private ngZone: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    this.idEmergencia = normalizePacienteQrId(this.idEmergencia);
    if (!this.idEmergencia) {
      this.qrDataUrl = '';
      return;
    }

    const dataUrl = await QRCode.toDataURL(buildPacienteQrPayload(this.idEmergencia), {
      margin: 1,
      width: 280,
    });

    this.ngZone.run(() => {
      this.qrDataUrl = dataUrl;
    });
  }

  cerrar(): void {
    this.modalCtrl.dismiss();
  }

  canCompartirWhatsapp(): boolean {
    return Boolean(this.idEmergencia && this.qrDataUrl && this.normalizePhoneVe(this.telefono));
  }

  async compartirWhatsApp(): Promise<void> {
    const telefono = this.normalizePhoneVe(this.telefono);
    if (!telefono || !this.idEmergencia || !this.qrDataUrl) return;

    const file = await this.buildQrFile();
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({
        files: [file],
        title: `QR ${this.idEmergencia}`,
        text: `QR del paciente ${this.nombre || this.idEmergencia} (+${telefono})`,
      });
      return;
    }

    const mensaje = 'Tu dispositivo no permite compartir imagenes directamente a WhatsApp. Se descargara el QR para compartirlo manualmente.';
    alert(mensaje);
    this.descargarQr(file);
  }

  private normalizePhoneVe(phone: string): string {
    const digits = (phone ?? '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('58')) return digits;
    if (digits.startsWith('0')) return `58${digits.slice(1)}`;
    return `58${digits}`;
  }

  private async buildQrFile(): Promise<File> {
    const blob = await (await fetch(this.qrDataUrl)).blob();
    return new File([blob], `qr-${this.idEmergencia}.png`, { type: 'image/png' });
  }

  private descargarQr(file: File): void {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
