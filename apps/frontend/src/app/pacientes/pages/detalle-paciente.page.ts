import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote, IonIcon,
  IonBackButton, IonSpinner, IonChip, IonList,
  ModalController, IonToast,
} from '@ionic/angular/standalone';
import { ListaNecesidadesPacienteComponent } from '../../shared/components/lista-necesidades-paciente/lista-necesidades-paciente.component';
import { PacientesService } from '../services/pacientes.service';
import { ConnectivityService } from '../../core/services/connectivity.service';
import { SyncQueueService, SyncOperationType } from '../../core/services/sync-queue.service';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import { EditarPacienteModal } from '../modals/editar-paciente.modal';
import { AgregarPatologiaModal } from '../modals/agregar-patologia.modal';
import { AgregarNecesidadModal } from '../modals/agregar-necesidad.modal';
import { AuthService } from '../../auth/services/auth.service';
import { Rol } from '../../shared/enums/rol.enum';
import QRCode from 'qrcode';
import { buildPacienteQrPayload, normalizePacienteQrId } from '../../shared/utils/paciente-qr.util';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonNote, IonIcon,
    IonBackButton, IonSpinner, IonChip, IonToast,
    ListaNecesidadesPacienteComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/pacientes"></ion-back-button>
        </ion-buttons>
        <ion-title>Detalle Paciente</ion-title>
        <ion-buttons slot="end">
          @if (puedeEditar()) {
            <ion-button (click)="editar()">
              <ion-icon name="create-outline"></ion-icon>
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando...</p>
        </div>
      }

      @if (paciente(); as p) {
        <ion-item>
          <ion-label>
            <h2>{{ p.nombre }} {{ p.apellido }}</h2>
            <p>ID: {{ p.id_emergencia }}</p>
            @if (p.cedula) { <p>C.I.: {{ p.cedula }}</p> }
            @if (p.telefono) { <p>Teléfono: {{ p.telefono }}</p> }
            <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ formatearEdadSimple(p) }} | {{ p.peso_estimado }} kg</p>
            <ion-note>{{ getSituacionViviendaLabel(p.situacion_vivienda) }}@if (p.es_titular) { · Titular de núcleo }</ion-note>
          </ion-label>
        </ion-item>

        <div class="qr-preview-card">
          <p class="qr-preview-title">QR del paciente</p>
          @if (qrPreviewDataUrl()) {
            <img [src]="qrPreviewDataUrl()" alt="QR del paciente" class="qr-preview-image" />
          } @else {
            <p class="qr-preview-empty">No se pudo generar el QR.</p>
          }
        </div>

        <ion-button expand="block" (click)="compartirQrWhatsApp()">
          <ion-icon name="logo-whatsapp" slot="start"></ion-icon>
          Compartir QR por WhatsApp
        </ion-button>

        <ion-button expand="block" fill="outline" (click)="compartirImagenQr()">
          Compartir imagen QR
        </ion-button>

        @if (puedeVerHistorial()) {
          <ion-button expand="block" fill="outline" (click)="verHistorial()">
            Ver historial de dispensaciones
          </ion-button>
        }

        @if (p.codigo_carpa && puedeEditar()) {
          <ion-button expand="block" fill="outline" (click)="irACarpa()">
            <ion-icon name="people-outline" slot="start"></ion-icon>
            Agregar familiar desde carpa
          </ion-button>
        }

        <h3>Núcleo familiar</h3>
        @if (familiares(); as f) {
          @if (f.length === 0) {
            <p>Sin familiares registrados</p>
          }
          @for (fam of f; track fam.id) {
            <ion-item>
              <ion-label>
                <h2>{{ fam.nombre }} {{ fam.apellido }}</h2>
                <p>{{ fam.id_emergencia }} · {{ fam.relacion }} · {{ fam.edad_estimada }} años · {{ fam.peso_estimado }} kg</p>
                <ion-note>{{ getSituacionViviendaLabel(fam.situacion_vivienda) }}</ion-note>
              </ion-label>
            </ion-item>
          }
        }

        <h3>Patologías</h3>
        @if (p.pacientePatologias && p.pacientePatologias.length > 0) {
          <ion-item>
            <ion-label>
              @for (pp of p.pacientePatologias; track pp.id) {
                <ion-chip color="danger">
                  <ion-label>{{ pp.patologia.nombre }}</ion-label>
                </ion-chip>
                @if (pp.tratamiento) {
                  <p class="tratamiento-text">{{ pp.tratamiento }}</p>
                }
              }
            </ion-label>
          </ion-item>
        } @else {
          <p>Sin patologías registradas</p>
        }
        @if (puedeEditar()) {
          <ion-button expand="block" fill="outline" (click)="agregarPatologia()">
            Agregar patología
          </ion-button>
        }

        <h3>Necesidades</h3>
        @if (p.pacienteNecesidades && p.pacienteNecesidades.length > 0) {
          <app-lista-necesidades-paciente
            [necesidades]="p.pacienteNecesidades"
            [pacienteId]="p.id"
            [puedeEditar]="puedeMarcarSuplida()"
            (suplidaChange)="onNecesidadSuplida()"
          ></app-lista-necesidades-paciente>
        } @else {
          <p>Sin necesidades registradas</p>
        }

        @if (puedeEditar()) {
          <ion-button expand="block" fill="outline" (click)="agregarNecesidad()">
            Agregar necesidad
          </ion-button>
        }

        @if (puedeEliminar()) {
          <ion-button expand="block" fill="clear" color="danger" (click)="eliminar()">
            Dar de baja paciente
          </ion-button>
        }
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
    .tratamiento-text {
      margin: var(--app-space-xs) 0 var(--app-space-sm) 0;
      font-size: var(--app-font-size-sm);
      color: var(--app-text-secondary);
      padding-left: var(--app-space-md);
    }
  `]
})
export class DetallePacientePage {
  cargando = signal(true);
  paciente = signal<Paciente | null>(null);
  familiares = signal<Familiar[]>([]);
  qrPreviewDataUrl = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger' | 'warning'>('success');
  private pacienteId = 0;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pacientesService = inject(PacientesService);
  private readonly modalCtrl = inject(ModalController);
  private readonly authService = inject(AuthService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly syncQueue = inject(SyncQueueService);

  constructor() {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  private get currentRole(): Rol | null {
    return this.authService.getUsuario()?.rol ?? null;
  }

  puedeVerHistorial(): boolean {
    return this.currentRole === Rol.DOCTOR || this.currentRole === Rol.ADMIN;
  }

  puedeEditar(): boolean {
    return this.currentRole === Rol.RECEPTIONIST || this.currentRole === Rol.ADMIN;
  }

  puedeEliminar(): boolean {
    return this.currentRole === Rol.RECEPTIONIST || this.currentRole === Rol.ADMIN;
  }

  puedeMarcarSuplida(): boolean {
    return this.currentRole === Rol.SURVEYOR || this.currentRole === Rol.ADMIN;
  }

  onNecesidadSuplida(): void {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.pacientesService.getPacienteById(this.pacienteId).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.familiares.set(p.familiares ?? []);
        this.generarVistaPreviaQr(p.id_emergencia);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        if (this.connectivity.isNetworkError(err)) {
          this.presentToast('Sin conexión. No se pudieron cargar los datos.', 'warning');
          return;
        }
      },
    });
  }

  private async generarVistaPreviaQr(idEmergencia: string): Promise<void> {
    const normalizado = normalizePacienteQrId(idEmergencia);
    if (!normalizado) {
      this.qrPreviewDataUrl.set('');
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(buildPacienteQrPayload(normalizado), {
        margin: 1,
        width: 220,
      });
      this.qrPreviewDataUrl.set(dataUrl);
    } catch {
      this.qrPreviewDataUrl.set('');
    }
  }

  verHistorial(): void {
    const p = this.paciente();
    if (!p) return;
    this.router.navigate(['/historial', p.id_emergencia]);
  }

  irACarpa(): void {
    const p = this.paciente();
    if (!p?.codigo_carpa) return;
    this.router.navigate(['/censo/carpa', p.codigo_carpa]);
  }

  async editar(): Promise<void> {
    const p = this.paciente();
    if (!p) return;
    EditarPacienteModal.pendingPaciente = p;
    const modal = await this.modalCtrl.create({
      component: EditarPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.pacientesService.actualizarPaciente(this.pacienteId, data).subscribe({
        next: () => this.cargar(),
        error: (err: unknown) => {
          if (this.connectivity.isNetworkError(err)) {
            this.syncQueue.enqueue({
              type: SyncOperationType.UPDATE_PATIENT,
              endpoint: `/pacientes/${this.pacienteId}`,
              method: 'PATCH',
              body: data,
              metadata: { descripcion: `Actualizar paciente: ${p.nombre} ${p.apellido}` },
            });
            this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
            return;
          }
          this.presentToast('Error al actualizar.', 'danger');
        },
      });
    }
  }

  async agregarPatologia(): Promise<void> {
    const p = this.paciente();
    if (!p) return;

    const modal = await this.modalCtrl.create({
      component: AgregarPatologiaModal,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role !== 'confirm' || !data) return;

    this.pacientesService.agregarPatologia(p.id, data).subscribe({
      next: () => this.cargar(),
      error: (err: unknown) => {
        if (this.connectivity.isNetworkError(err)) {
          this.syncQueue.enqueue({
            type: SyncOperationType.UPDATE_PATIENT,
            endpoint: `/pacientes/${p.id}/patologias`,
            method: 'POST',
            body: data,
            metadata: { descripcion: `Agregar patología a paciente: ${p.nombre} ${p.apellido}` },
          });
          this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
          return;
        }
        this.presentToast('Error al agregar patología.', 'danger');
      },
    });
  }

  async agregarNecesidad(): Promise<void> {
    const p = this.paciente();
    if (!p) return;

    const modal = await this.modalCtrl.create({
      component: AgregarNecesidadModal,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role !== 'confirm' || !data) return;

    this.pacientesService.agregarNecesidad(p.id, data.necesidadId).subscribe({
      next: () => this.cargar(),
      error: (err: unknown) => {
        if (this.connectivity.isNetworkError(err)) {
          this.syncQueue.enqueue({
            type: SyncOperationType.UPDATE_PATIENT,
            endpoint: `/pacientes/${p.id}/necesidades`,
            method: 'POST',
            body: data,
            metadata: { descripcion: `Agregar necesidad a paciente: ${p.nombre} ${p.apellido}` },
          });
          this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
          return;
        }
        this.presentToast('Error al agregar necesidad.', 'danger');
      },
    });
  }

  compartirQrWhatsApp(): void {
    const p = this.paciente();
    if (!p) return;

    const phone = this.normalizePhoneVe(p.telefono ?? '');
    if (!phone) {
      alert('El paciente no tiene un numero telefonico valido para WhatsApp.');
      return;
    }

    const idEmergencia = normalizePacienteQrId(p.id_emergencia);
    const nombre = `${p.nombre} ${p.apellido}`.trim();
    const mensaje = idEmergencia
      ? `Hola ${nombre}, este es tu ID de emergencia: ${idEmergencia}`
      : `Hola ${nombre}`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  async compartirImagenQr(): Promise<void> {
    const p = this.paciente();
    if (!p) return;

    const dataUrl = this.qrPreviewDataUrl();
    if (!dataUrl) {
      alert('No se pudo generar la imagen QR para compartir.');
      return;
    }

    const idEmergencia = normalizePacienteQrId(p.id_emergencia);
    const file = await this.buildQrFile(dataUrl, idEmergencia || 'paciente');
    const text = idEmergencia
      ? `ID de emergencia del paciente: ${idEmergencia}`
      : 'QR del paciente';

    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({
        files: [file],
        title: `QR ${idEmergencia || 'paciente'}`,
        text,
      });
      return;
    }

    this.descargarQr(file);
    alert('Tu dispositivo no permite compartir imagenes directamente. Se descargo el QR para compartirlo manualmente.');
  }

  private normalizePhoneVe(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('58')) return digits;
    if (digits.startsWith('0')) return `58${digits.slice(1)}`;
    return `58${digits}`;
  }

  private async buildQrFile(dataUrl: string, idEmergencia: string): Promise<File> {
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], `qr-${idEmergencia}.png`, { type: 'image/png' });
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

  formatearEdadSimple(p: Paciente): string {
    if (p.es_recien_nacido) return 'Recién nacido';
    if (p.fecha_nacimiento) {
      const nac = new Date(p.fecha_nacimiento);
      const hoy = new Date();
      let edad = hoy.getFullYear() - nac.getFullYear();
      const mes = hoy.getMonth() - nac.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
      if (edad < 2) {
        const meses = Math.max(0, (hoy.getFullYear() - nac.getFullYear()) * 12 + hoy.getMonth() - nac.getMonth());
        return `${meses} meses`;
      }
      return `${edad} años`;
    }
    return `${p.edad_estimada} años`;
  }

  eliminar(): void {
    this.pacientesService.eliminarPaciente(this.pacienteId).subscribe({
      next: () => this.router.navigate(['/pacientes']),
      error: (err: unknown) => {
        if (this.connectivity.isNetworkError(err)) {
          const p = this.paciente();
          this.syncQueue.enqueue({
            type: SyncOperationType.DELETE_PATIENT,
            endpoint: `/pacientes/${this.pacienteId}`,
            method: 'DELETE',
            body: null,
            metadata: { descripcion: `Eliminar paciente: ${p?.nombre} ${p?.apellido}` },
          });
          this.presentToast('Guardado en cola. Se sincronizará cuando haya conexión.', 'warning');
          return;
        }
        this.presentToast('Error al dar de baja.', 'danger');
      },
    });
  }

  getSituacionViviendaLabel(value: string | undefined | null): string {
    const labels: Record<string, string> = {
      'no_afectado': 'No afectado',
      'vivienda_afectada': 'Vivienda afectada',
      'damnificado': 'Damnificado',
    };
    return labels[value ?? ''] ?? value ?? 'No afectado';
  }

  private presentToast(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }
}
