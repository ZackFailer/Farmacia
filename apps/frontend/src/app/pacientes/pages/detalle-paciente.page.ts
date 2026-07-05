import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote, IonIcon,
  IonMenuButton, IonSpinner, ModalController,
} from '@ionic/angular/standalone';
import { PacientesService } from '../services/pacientes.service';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Familiar } from '../../shared/models/familiar.model';
import { EditarPacienteModal } from '../modals/editar-paciente.modal';
import { AgregarFamiliarModal } from '../modals/agregar-familiar.modal';
import { PacienteQrModal } from '../modals/paciente-qr.modal';
import { AuthService } from '../../auth/services/auth.service';
import { Rol } from '../../shared/enums/rol.enum';
import QRCode from 'qrcode';
import { buildPacienteQrPayload, normalizePacienteQrId } from '../../shared/utils/paciente-qr.util';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonNote, IonIcon,
    IonMenuButton, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
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
            <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
            <ion-note>@if (p.es_damnificado) { Damnificado } @else { No damnificado }@if (p.es_titular) { · Titular de núcleo }</ion-note>
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

        @if (puedeVerHistorial()) {
          <ion-button expand="block" fill="outline" (click)="verHistorial()">
            Ver historial de dispensaciones
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
                <ion-note>{{ fam.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
              </ion-label>
            </ion-item>
          }
        }

        <ion-button expand="block" fill="outline" (click)="agregarFamiliar()">
          + Agregar familiar
        </ion-button>

        @if (puedeEliminar()) {
          <ion-button expand="block" fill="clear" color="danger" (click)="eliminar()">
            Dar de baja paciente
          </ion-button>
        }
      }
    </ion-content>
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
  `]
})
export class DetallePacientePage {
  cargando = signal(true);
  paciente = signal<Paciente | null>(null);
  familiares = signal<Familiar[]>([]);
  qrPreviewDataUrl = signal('');
  private pacienteId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pacientesService: PacientesService,
    private modalCtrl: ModalController,
    private authService: AuthService,
  ) {
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

  private cargar(): void {
    this.cargando.set(true);
    this.pacientesService.getPacienteById(this.pacienteId).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.familiares.set(p.familiares ?? []);
        this.generarVistaPreviaQr(p.id_emergencia);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
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

  async editar(): Promise<void> {
    const p = this.paciente();
    if (!p) return;
    const modal = await this.modalCtrl.create({
      component: EditarPacienteModal,
    });
    const instance = modal.component as unknown as { setPaciente: (p: Paciente) => void };
    if (instance.setPaciente) instance.setPaciente(p);
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.pacientesService.actualizarPaciente(this.pacienteId, data).subscribe({
        next: () => this.cargar(),
      });
    }
  }

  async agregarFamiliar(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AgregarFamiliarModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.pacientesService.agregarFamiliar(this.pacienteId, data.pacienteId, data.relacion).subscribe({
        next: () => this.cargar(),
      });
    }
  }

  async compartirQrWhatsApp(): Promise<void> {
    const p = this.paciente();
    if (!p) return;

    const modal = await this.modalCtrl.create({
      component: PacienteQrModal,
      componentProps: {
        idEmergencia: normalizePacienteQrId(p.id_emergencia),
        nombre: `${p.nombre} ${p.apellido}`,
        telefono: p.telefono ?? '',
      },
    });
    await modal.present();
  }

  eliminar(): void {
    this.pacientesService.eliminarPaciente(this.pacienteId).subscribe({
      next: () => this.router.navigate(['/pacientes']),
    });
  }
}
