import { Component, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSpinner,
  IonCard, IonCardContent, IonBackButton, IonToast, IonIcon,
} from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import type { NucleoFamiliar } from '../../shared/models/nucleo-familiar.model';
import QRCode from 'qrcode';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSpinner,
    IonCard, IonCardContent, IonBackButton, IonToast, IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/censo/carpas"></ion-back-button>
        </ion-buttons>
        <ion-title>Nueva Carpa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Creando carpa...</p>
        </div>
      }

      @if (!cargando() && !resultado()) {
        <form [formGroup]="form" (ngSubmit)="crear()">
          <ion-item>
            <ion-label position="stacked">Ubicaci&oacute;n</ion-label>
            <ion-input
              formControlName="ubicacion"
              type="text"
              placeholder="Ej: Sector A, m&oacute;dulo 3"
            ></ion-input>
          </ion-item>

          @if (error()) {
            <p class="app-inline-error">{{ error() }}</p>
          }

          <ion-button
            type="submit"
            expand="block"
            color="primary"
            class="ion-margin-top"
            [disabled]="form.invalid"
          >
            Crear Carpa
          </ion-button>
        </form>
      }

      @if (!cargando() && resultado(); as carpa) {
        <ion-card class="resultado-card">
          <ion-card-content>
            <h2 class="resultado-titulo">Carpa creada exitosamente</h2>

            <div class="codigo-carpa">
              <span class="codigo-label">C&oacute;digo de carpa:</span>
              <span class="codigo-valor">{{ carpa.codigoCarpa }}</span>
            </div>

            @if (carpa.ubicacion) {
              <p class="ubicacion-texto">
                Ubicaci&oacute;n: {{ carpa.ubicacion }}
              </p>
            }

            <div class="qr-preview-card">
              <p class="qr-preview-title">QR de la carpa</p>
              @if (qrPreviewDataUrl()) {
                <img [src]="qrPreviewDataUrl()" alt="QR de la carpa" class="qr-preview-image" />
              } @else {
                <p class="qr-preview-empty">No se pudo generar el QR.</p>
              }
            </div>

            <ion-button expand="block" fill="outline" (click)="copiarImagenQr()" [disabled]="!qrPreviewDataUrl()">
              <ion-icon name="copy-outline" slot="start"></ion-icon>
              Copiar imagen QR
            </ion-button>

            <ion-button expand="block" fill="outline" (click)="compartirImagenQr()" [disabled]="!qrPreviewDataUrl()">
              <ion-icon name="share-social-outline" slot="start"></ion-icon>
              Compartir imagen QR
            </ion-button>

            <ion-button expand="block" fill="outline" color="medium" (click)="descargarImagenQr()" [disabled]="!qrPreviewDataUrl()">
              <ion-icon name="download-outline" slot="start"></ion-icon>
              Descargar QR
            </ion-button>

            <ion-button
              expand="block"
              color="primary"
              class="ion-margin-top"
              (click)="irACarpa(carpa.codigoCarpa!)"
            >
              Registrar paciente en esta carpa
            </ion-button>

            <ion-button
              expand="block"
              fill="outline"
              color="medium"
              class="ion-margin-top"
              (click)="resetForm()"
            >
              Crear otra carpa
            </ion-button>
          </ion-card-content>
        </ion-card>
      }
    </ion-content>

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    .app-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--app-space-2xl, 32px);
      text-align: center;
      min-height: 200px;
      color: var(--app-text-secondary, #5a5a7a);
    }

    .app-inline-error {
      color: var(--app-error, #dc3545);
      font-size: var(--app-font-size-sm, 0.875rem);
      margin: var(--app-space-sm, 8px) 0;
      padding: var(--app-space-sm, 8px);
      background: var(--app-error-bg, #ffebee);
      border-radius: var(--app-radius-sm, 6px);
    }

    .resultado-card {
      margin-top: var(--app-space-lg, 16px);
      border-radius: var(--app-radius-md, 10px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .resultado-titulo {
      font-size: var(--app-font-size-lg, 1.125rem);
      font-weight: 600;
      color: var(--app-success, #28a745);
      margin-bottom: var(--app-space-lg, 16px);
      text-align: center;
    }

    .codigo-carpa {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-space-xs, 4px);
      margin-bottom: var(--app-space-lg, 16px);
      padding: var(--app-space-lg, 16px);
      background: var(--app-bg, #f4f5f7);
      border-radius: var(--app-radius-sm, 6px);
    }

    .codigo-label {
      font-size: var(--app-font-size-sm, 0.875rem);
      color: var(--app-text-secondary, #5a5a7a);
    }

    .codigo-valor {
      font-size: var(--app-font-size-2xl, 1.5rem);
      font-weight: 700;
      color: var(--app-primary, #1a5276);
      letter-spacing: 1px;
    }

    .ubicacion-texto {
      font-size: var(--app-font-size-md, 1rem);
      color: var(--app-text, #1a1a2e);
      text-align: center;
      margin-bottom: var(--app-space-sm, 8px);
    }

    .qr-preview-card {
      margin: var(--app-space-md) auto;
      padding: var(--app-space-md);
      border: 1px solid var(--app-border);
      border-radius: var(--app-radius-md);
      background: var(--app-surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--app-space-sm);
      width: fit-content;
    }

    .qr-preview-title {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
      font-weight: 600;
      text-align: center;
    }

    .qr-preview-image {
      width: min(220px, 72vw);
      height: min(220px, 72vw);
      border-radius: var(--app-radius-sm);
      border: 1px solid var(--app-border);
      background: var(--app-surface);
      padding: var(--app-space-xs);
    }

    .qr-preview-empty {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: var(--app-font-size-sm);
    }

    ion-item {
      --border-radius: var(--app-radius-sm, 6px);
      --padding-start: var(--app-space-md, 12px);
      --padding-end: var(--app-space-md, 12px);
      margin-bottom: var(--app-space-md, 12px);
    }

    ion-button {
      --min-height: 48px;
    }
  `],
})
export class CrearCarpaPage {
  cargando = signal(false);
  resultado = signal<NucleoFamiliar | null>(null);
  error = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger'>('success');
  qrPreviewDataUrl = signal('');

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly pacientesService = inject(PacientesService);

  protected readonly form = this.fb.nonNullable.group({
    ubicacion: ['', Validators.required],
  });

  crear(): void {
    if (this.form.invalid) return;

    this.cargando.set(true);
    this.error.set('');
    this.resultado.set(null);

    const dto = { ubicacion: this.form.value.ubicacion ?? undefined };

    this.pacientesService.crearCarpa(dto).subscribe({
      next: (carpa) => {
        this.resultado.set(carpa);
        void this.generarVistaPreviaQr(carpa.codigoCarpa ?? '');
        this.cargando.set(false);
        this.presentToast('Carpa creada exitosamente.', 'success');
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        const msg = this.getErrorMessage(err, 'No se pudo crear la carpa.');
        this.error.set(msg);
        this.presentToast(msg, 'danger');
      },
    });
  }

  irACarpa(codigo: string): void {
    this.router.navigate(['/censo/carpa', codigo]);
  }

  resetForm(): void {
    this.form.reset();
    this.resultado.set(null);
    this.error.set('');
    this.qrPreviewDataUrl.set('');
  }

  async compartirImagenQr(): Promise<void> {
    const carpa = this.resultado();
    if (!carpa) return;

    const dataUrl = this.qrPreviewDataUrl();
    if (!dataUrl) {
      this.presentToast('No se pudo generar la imagen QR para compartir.', 'danger');
      return;
    }

    const file = await this.buildQrFile(dataUrl, carpa.codigoCarpa || 'carpa');
    const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };

    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({
        files: [file],
        title: `QR ${carpa.codigoCarpa || 'carpa'}`,
        text: `Codigo de carpa: ${carpa.codigoCarpa || ''}`,
      });
      return;
    }

    this.descargarQr(file);
    this.presentToast('Tu dispositivo no permite compartir imagenes directamente. Se descargo el QR.', 'success');
  }

  async copiarImagenQr(): Promise<void> {
    const dataUrl = this.qrPreviewDataUrl();
    if (!dataUrl) return;
    const clipboard = navigator.clipboard as Clipboard & {
      write?: (items: ClipboardItem[]) => Promise<void>;
    };
    if (!clipboard?.write || typeof ClipboardItem === 'undefined') {
      this.presentToast('Copiado no disponible. Usa Compartir o Descargar.', 'danger');
      return;
    }

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await clipboard.write([item]);
      this.presentToast('Imagen QR copiada al portapapeles.', 'success');
    } catch {
      this.presentToast('No se pudo copiar la imagen QR.', 'danger');
    }
  }

  async descargarImagenQr(): Promise<void> {
    const carpa = this.resultado();
    if (!carpa) return;
    const dataUrl = this.qrPreviewDataUrl();
    if (!dataUrl) return;
    const file = await this.buildQrFile(dataUrl, carpa.codigoCarpa || 'carpa');
    this.descargarQr(file);
  }

  private presentToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }

  private async generarVistaPreviaQr(codigoCarpa: string): Promise<void> {
    const codigo = (codigoCarpa ?? '').trim();
    if (!codigo) {
      this.qrPreviewDataUrl.set('');
      return;
    }
    try {
      const dataUrl = await QRCode.toDataURL(codigo, {
        margin: 1,
        width: 220,
      });
      this.qrPreviewDataUrl.set(dataUrl);
    } catch {
      this.qrPreviewDataUrl.set('');
    }
  }

  private async buildQrFile(dataUrl: string, codigoCarpa: string): Promise<File> {
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], `qr-${codigoCarpa}.png`, { type: 'image/png' });
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
