import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonSpinner,
  IonCard, IonCardContent, IonCardTitle,
  IonList, IonNote, IonIcon, IonBackButton, IonChip,
  IonFab, IonFabButton, IonToast, ModalController,
} from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { RegistrarPacienteCarpaModal } from '../modals/registrar-paciente-carpa.modal';
import type { NucleoFamiliar, NucleoMiembro } from '../../shared/models/nucleo-familiar.model';
import type { Paciente } from '../../shared/models/paciente.model';
import QRCode from 'qrcode';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonSpinner,
    IonCard, IonCardContent, IonCardTitle,
    IonList, IonNote, IonIcon, IonBackButton, IonChip,
    IonFab, IonFabButton, IonToast,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/censo/carpas"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle de Carpa</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando carpa...</p>
        </div>
      }

      @if (error(); as errMsg) {
        <div class="app-error-state">
          <ion-icon name="cloud-offline-outline"></ion-icon>
          <p>{{ errMsg }}</p>
          <ion-button fill="outline" (click)="cargar()">Reintentar</ion-button>
        </div>
      }

      @if (!cargando() && !error() && carpa(); as c) {
        <!-- Card: Información de la Carpa -->
        <ion-card>
          <ion-card-title>Información de la Carpa</ion-card-title>
          <ion-card-content>
            <div class="info-row">
              <span class="info-label">Código</span>
              <span class="info-value codigo">{{ c.codigoCarpa }}</span>
            </div>
            @if (c.ubicacion) {
              <div class="info-row">
                <span class="info-label">Ubicación</span>
                <span class="info-value">{{ c.ubicacion }}</span>
              </div>
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
          </ion-card-content>
        </ion-card>

        <!-- Sección: Miembros -->
        <h3 class="section-title">
          Miembros
          @if (miembros(); as list) {
            <span class="section-count">({{ list.length }})</span>
          }
        </h3>

        @if (miembros(); as list) {
          @if (list.length === 0) {
            <div class="app-empty">
              <ion-icon name="people-outline" class="app-empty-icon"></ion-icon>
              <h3>Sin miembros registrados</h3>
              <p>Esta carpa no tiene miembros asociados.</p>
            </div>
          } @else {
            <ion-list>
              @for (m of list; track m.id) {
                <ion-item button class="miembro-item" (click)="verPaciente(m.paciente?.id)">
                  <ion-label>
                    <h2>{{ m.paciente?.nombre ?? '' }} {{ m.paciente?.apellido ?? '' }}</h2>
                    <p class="miembro-meta">
                      {{ formatearSexo(m.paciente?.sexo) }} ·
                      {{ formatearEdad(m.paciente) }}
                      @if (m.paciente?.peso_estimado !== null && m.paciente?.peso_estimado !== undefined) {
                        · {{ m.paciente!.peso_estimado }} kg
                      }
                    </p>
                    @if (m.relacion) {
                      <ion-note>Relación: {{ m.relacion }}</ion-note>
                    }
                  </ion-label>

                  @if (m.paciente?.tiene_discapacidad_motora) {
                    <ion-chip slot="end" color="warning" class="chip-discapacidad">
                      <ion-icon name="accessibility-outline"></ion-icon>
                      <ion-label>Disc. motora</ion-label>
                    </ion-chip>
                  }
                </ion-item>

                @if (tienePatologias(m.paciente) || tieneNecesidades(m.paciente)) {
                  <div class="miembro-detalles">
                    @if (tienePatologias(m.paciente); as patologias) {
                      <div class="detalle-seccion">
                        <span class="detalle-titulo">Patologías</span>
                        <div class="detalle-chips">
                          @for (pp of patologias; track pp.id) {
                            <ion-chip color="danger" class="chip-patologia">
                              <ion-label>{{ pp.patologia.nombre }}</ion-label>
                            </ion-chip>
                          }
                        </div>
                      </div>
                    }

                    @if (tieneNecesidades(m.paciente); as necesidades) {
                      <div class="detalle-seccion">
                        <span class="detalle-titulo">Necesidades</span>
                        <div class="detalle-chips">
                          @for (pn of necesidades; track pn.id) {
                            <ion-chip color="primary" class="chip-necesidad">
                              <ion-label>{{ pn.necesidad.nombre }}</ion-label>
                            </ion-chip>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            </ion-list>
          }
        }
      }
    </ion-content>

    @if (!cargando() && !error()) {
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="primary" (click)="registrarPaciente()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    }

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
  styles: [`
    ion-card {
      margin: 0 0 var(--app-space-lg);
      border-radius: var(--app-radius-md);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    ion-card-title {
      font-size: var(--app-font-size-lg);
      font-weight: 600;
      color: var(--app-text);
      padding: var(--app-space-lg) var(--app-space-lg) 0;
      display: block;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-xs);
      padding: var(--app-space-sm) 0;
    }

    .info-row + .info-row {
      border-top: 1px solid var(--app-divider);
    }

    .info-label {
      font-size: var(--app-font-size-sm);
      font-weight: 500;
      color: var(--app-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .info-value {
      font-size: var(--app-font-size-md);
      color: var(--app-text);
    }

    .info-value.codigo {
      font-size: var(--app-font-size-xl);
      font-weight: 700;
      color: var(--app-primary);
      letter-spacing: 1px;
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

    .section-title {
      font-size: var(--app-font-size-lg);
      font-weight: 600;
      color: var(--app-text);
      margin: var(--app-space-lg) 0 var(--app-space-md);
      display: flex;
      align-items: center;
      gap: var(--app-space-sm);
    }

    .section-count {
      font-size: var(--app-font-size-sm);
      font-weight: 400;
      color: var(--app-text-secondary);
    }

    .miembro-item {
      --padding-start: var(--app-space-md);
      --padding-end: var(--app-space-md);
      --inner-padding-end: 0;
      margin-bottom: 0;
    }

    .miembro-item h2 {
      font-size: var(--app-font-size-md);
      font-weight: 600;
      color: var(--app-text);
      margin-bottom: var(--app-space-xs);
    }

    .miembro-meta {
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      margin: var(--app-space-xs) 0;
    }

    .chip-discapacidad {
      margin: 0;
      font-size: var(--app-font-size-xs);
      flex-shrink: 0;
    }

    .miembro-detalles {
      background: var(--app-bg);
      padding: var(--app-space-sm) var(--app-space-lg) var(--app-space-md);
      margin-bottom: var(--app-space-md);
      border-radius: 0 0 var(--app-radius-sm) var(--app-radius-sm);
      border-bottom: 1px solid var(--app-divider);
    }

    .detalle-seccion {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-xs);
    }

    .detalle-seccion + .detalle-seccion {
      margin-top: var(--app-space-sm);
      padding-top: var(--app-space-sm);
      border-top: 1px solid var(--app-divider);
    }

    .detalle-titulo {
      font-size: var(--app-font-size-xs);
      font-weight: 600;
      color: var(--app-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .detalle-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-xs);
    }

    .detalle-chips ion-chip {
      margin: 0;
      font-size: var(--app-font-size-xs);
    }

    .chip-patologia {
      --background: var(--app-error-bg);
      --color: var(--app-error);
    }

    .chip-necesidad {
      --background: color-mix(in srgb, var(--app-primary) 12%, transparent);
      --color: var(--app-primary);
    }

    ion-list {
      padding: 0;
      background: transparent;
    }
  `],
})
export class DetalleCarpaPage {
  cargando = signal(true);
  error = signal('');
  carpa = signal<NucleoFamiliar | null>(null);
  miembros = signal<NucleoMiembro[]>([]);
  qrPreviewDataUrl = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger'>('success');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pacientesService = inject(PacientesService);
  private readonly modalCtrl = inject(ModalController);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (!codigo) {
      this.error.set('Código de carpa no proporcionado.');
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.carpa.set(null);
    this.miembros.set([]);
    this.qrPreviewDataUrl.set('');

    this.pacientesService.getCarpaByCodigo(codigo).subscribe({
      next: (data) => {
        this.carpa.set(data);
        this.miembros.set(data.miembros ?? []);
        void this.generarVistaPreviaQr(data.codigoCarpa ?? '');
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        this.error.set(this.getErrorMessage(err, 'No se pudo cargar la información de la carpa.'));
      },
    });
  }

  formatearSexo(sexo?: string): string {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return 'No especificado';
  }

  formatearEdad(paciente?: Paciente | null): string {
    if (!paciente) return '';
    if (paciente.es_recien_nacido) return 'Recién nacido';
    if (paciente.fecha_nacimiento) {
      const nac = new Date(paciente.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nac.getFullYear();
      const mes = hoy.getMonth() - nac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
      if (edad < 2) {
        const meses = Math.max(0, (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth());
        return `${meses} mes${meses !== 1 ? 'es' : ''}`;
      }
      return `${edad} año${edad !== 1 ? 's' : ''}`;
    }
    if (paciente.edad_manual != null) return `${paciente.edad_manual} año${paciente.edad_manual !== 1 ? 's' : ''}`;
    return `${paciente.edad_estimada} año${paciente.edad_estimada !== 1 ? 's' : ''}`;
  }

  tienePatologias(paciente?: Paciente | null): { id: number; patologiaId: number; tratamiento?: string; patologia: { id: number; nombre: string } }[] | null {
    if (!paciente?.pacientePatologias || paciente.pacientePatologias.length === 0) return null;
    return paciente.pacientePatologias;
  }

  tieneNecesidades(paciente?: Paciente | null): { id: number; necesidadId: number; necesidad: { id: number; nombre: string } }[] | null {
    if (!paciente?.pacienteNecesidades || paciente.pacienteNecesidades.length === 0) return null;
    return paciente.pacienteNecesidades;
  }

  async registrarPaciente(): Promise<void> {
    const carpaActual = this.carpa();
    if (!carpaActual) return;

    const modal = await this.modalCtrl.create({
      component: RegistrarPacienteCarpaModal,
      componentProps: { codigoCarpa: carpaActual.codigoCarpa },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data?.success) {
      this.presentToast('Paciente registrado y agregado a la carpa.', 'success');
      this.cargar();
    }
  }

  async compartirImagenQr(): Promise<void> {
    const carpa = this.carpa();
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
    const carpa = this.carpa();
    if (!carpa) return;
    const dataUrl = this.qrPreviewDataUrl();
    if (!dataUrl) return;
    const file = await this.buildQrFile(dataUrl, carpa.codigoCarpa || 'carpa');
    this.descargarQr(file);
  }

  verPaciente(pacienteId?: number): void {
    if (pacienteId) {
      this.router.navigate(['/pacientes', pacienteId]);
    }
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
