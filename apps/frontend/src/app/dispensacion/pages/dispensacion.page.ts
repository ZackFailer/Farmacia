import { Component, signal, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonNote,
  IonSearchbar,
  IonIcon,
  IonList,
  IonSpinner,
  IonToast,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  ModalController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import { DispensacionService } from '../services/dispensacion.service';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { RegistroPacienteModal } from '../../pacientes/modals/registro-paciente.modal';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Receta } from '../../shared/models/receta.model';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonNote,
    IonSearchbar,
    IonIcon,
    IonList,
    IonSpinner,
    IonToast,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    EscanerQrComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dispensación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h3>Identificación del paciente</h3>
      @if (!pacienteIdentificado()) {
        <div style="text-align: center; padding: var(--app-space-2xl) 0;">
          <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>
          <p style="margin: var(--app-space-lg) 0 var(--app-space-xl);">Escanee el código del paciente (brazalete / receta)</p>

          <ion-searchbar [(ngModel)]="codigoBuscado" (ionInput)="buscarPorCodigo()" placeholder="Buscar por ID emergencia o cédula..." debounce="500"></ion-searchbar>

          @if (!codigoBuscado || !codigoBuscado.trim()) {
            <p class="app-text-secondary" style="text-align:center;font-size:var(--app-font-size-sm);margin:0 0 var(--app-space-lg);">Ingrese el ID de emergencia, nombre o cédula del paciente. También puede escanear su código QR.</p>
          }
        </div>
      }

      @if (resultadosBusqueda().length > 0 && !pacienteIdentificado()) {
        <ion-list>
          @for (p of resultadosBusqueda(); track p.id) {
            <ion-item button (click)="seleccionarPaciente(p)">
              <ion-label>
                <h2>{{ p.nombre }} {{ p.apellido }}</h2>
                <p>{{ p.id_emergencia }} @if (p.cedula) { · C.I.: {{ p.cedula }} }</p>
                <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} · {{ p.edad_estimada }} años</ion-note>
              </ion-label>
            </ion-item>
          }
        </ion-list>
      }

      @if (errorMsg()) {
        <div class="app-error-state app-error-compact">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <p>{{ errorMsg() }}</p>
          <ion-button fill="outline" size="small" (click)="limpiarError()">Intentar de nuevo</ion-button>
        </div>
      }

      @if (pacienteIdentificado(); as p) {
        <ion-item>
          <ion-label>
            <h2>{{ p.nombre }} {{ p.apellido }}</h2>
            <p>ID: {{ p.id_emergencia }}</p>
            @if (p.cedula) { <p>C.I.: {{ p.cedula }}</p> }
            <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</p>
            <ion-note>{{ getSituacionViviendaLabel(p.situacion_vivienda) }} @if (p.es_titular) { · Titular de núcleo familiar } @else if (p.tiene_carga_familiar) { · Carga familiar }</ion-note>
            @if (p.pacientePatologias && p.pacientePatologias.length > 0) {
              <div class="paciente-patologias">
                <ion-note color="primary">
                  @for (pp of p.pacientePatologias; track pp.id; let last = $last) {
                    {{ pp.patologia.nombre }}{{ !last ? ', ' : '' }}
                  }
                </ion-note>
              </div>
            }
          </ion-label>
        </ion-item>

        @if (p.familiares?.length) {
          <div class="familiares-card">
            <p class="familiares-title">Núcleo familiar ({{ p.familiares!.length }})</p>
            @for (f of p.familiares; track f.id) {
              <div class="familiar-row">
                <span class="familiar-nombre">{{ f.nombre }} {{ f.apellido }}</span>
                <span class="familiar-detalle">{{ f.relacion }} · {{ f.edad_estimada }} años · {{ f.peso_estimado }} kg · {{ f.sexo === 'M' ? 'M' : 'F' }} · {{ getSituacionViviendaLabel(f.situacion_vivienda) }}</span>
              </div>
            }
          </div>
        }

        <ion-button expand="block" fill="clear" color="medium" (click)="verHistorial()">
          Ver historial del paciente
        </ion-button>

        <div style="display: flex; gap: var(--app-space-md); margin-top: var(--app-space-md);">
          <ion-button expand="block" fill="outline" color="medium" (click)="cancelar()">Cancelar</ion-button>
          <ion-button expand="block" (click)="siguiente()">Validar medicamentos →</ion-button>
        </div>
      }

      <h3 style="margin-top: var(--app-space-xl);">Recetas pendientes</h3>
      @if (cargandoRecetas()) {
        <div class="app-loading app-loading-compact">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando recetas pendientes...</p>
        </div>
      } @else if (recetasPendientes().length === 0) {
        <p class="app-text-secondary">No hay recetas pendientes para dispensación.</p>
      } @else {
        <ion-list>
          @for (receta of recetasPendientes(); track receta.id) {
            <ion-item button (click)="seleccionarRecetaPendiente(receta)">
              <ion-label>
                <h2>{{ receta.paciente?.nombre }} {{ receta.paciente?.apellido }}</h2>
                <p>{{ receta.paciente?.id_emergencia }} @if (receta.paciente?.cedula) { · C.I.: {{ receta.paciente?.cedula }} }</p>
                @if (receta.motivo) {
                  <ion-note color="primary">{{ receta.motivo }}</ion-note>
                }
                <ion-note>{{ receta.detalles.length }} medicamento(s) · Dr. {{ receta.doctor?.nombre ?? 'N/A' }}</ion-note>
              </ion-label>
              <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
            </ion-item>
          }
        </ion-list>
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
    .familiares-card {
      margin: var(--app-space-md) 0;
      padding: var(--app-space-md);
      background: var(--app-bg);
      border-radius: var(--app-radius-md);
      border-left: 3px solid var(--app-primary-light);
    }
    .familiares-title {
      font-size: var(--app-font-size-sm);
      font-weight: 600;
      color: var(--app-text-secondary);
      margin: 0 0 var(--app-space-sm);
    }
    .familiar-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--app-space-xs) 0;
      border-bottom: 1px solid var(--app-divider);
    }
    .familiar-row:last-child {
      border-bottom: none;
    }
    .familiar-nombre {
      font-size: var(--app-font-size-sm);
      font-weight: 500;
    }
    .familiar-detalle {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
    }
    .paciente-patologias {
      margin-top: var(--app-space-xs);
    }
  `],
})
export class DispensacionPage implements ViewWillEnter {
  codigoBuscado = '';
  pacienteIdentificado = signal<Paciente | null>(null);
  resultadosBusqueda = signal<Paciente[]>([]);
  errorMsg = signal('');
  recetasPendientes = signal<Receta[]>([]);
  cargandoRecetas = signal(false);
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger'>('success');

  private readonly dispensacionService = inject(DispensacionService);
  private readonly pacientesService = inject(PacientesService);
  private readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);

  ionViewWillEnter(): void {
    this.pacienteIdentificado.set(null);
    this.resultadosBusqueda.set([]);
    this.codigoBuscado = '';
    this.errorMsg.set('');
    this.cargarRecetasPendientes();
  }

  onCodigoEscaneado(codigo: string): void {
    this.codigoBuscado = codigo;
    this.buscarPorCodigo();
  }

  buscarPorCodigo(): void {
    const term = this.codigoBuscado.trim();
    if (!term) return;

    this.pacientesService.buscarPaciente(term).subscribe({
      next: (p) => {
        if (p.length === 0) {
          this.errorMsg.set('Paciente no encontrado con ese criterio');
          this.resultadosBusqueda.set([]);
          return;
        }
        if (p.length === 1 && term.startsWith('EM-')) {
          this.pacienteIdentificado.set(p[0]);
          this.resultadosBusqueda.set([]);
        } else {
          this.resultadosBusqueda.set(p);
        }
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Paciente no encontrado con ese criterio');
        this.resultadosBusqueda.set([]);
      },
    });
  }

  seleccionarPaciente(p: Paciente): void {
    this.pacienteIdentificado.set(p);
    this.resultadosBusqueda.set([]);
    this.codigoBuscado = '';
  }

  private cargarRecetasPendientes(): void {
    this.cargandoRecetas.set(true);
    this.dispensacionService.getRecetasPendientes().subscribe({
      next: (items) => {
        this.recetasPendientes.set(items);
        this.cargandoRecetas.set(false);
      },
      error: () => {
        this.recetasPendientes.set([]);
        this.cargandoRecetas.set(false);
      },
    });
  }

  seleccionarRecetaPendiente(receta: Receta): void {
    this.dispensacionService.setReceta(receta);
    this.router.navigate(['/dispensacion/medicamentos']);
  }

  async abrirRegistroPaciente(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RegistroPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm' && data) {
      this.pacientesService.registrarPaciente(data).subscribe({
        next: (p) => {
          this.pacienteIdentificado.set(p);
          this.presentToast('Paciente registrado correctamente.', 'success');
          this.router.navigate(['/pacientes', p.id]);
        },
        error: (error: unknown) => {
          const message = this.getErrorMessage(error, 'No se pudo registrar el paciente.');
          this.errorMsg.set(message);
          this.presentToast(message, 'danger');
        },
      });
    }
  }

  verHistorial(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.router.navigate(['/historial', p.id_emergencia]);
  }

  cancelar(): void {
    this.dispensacionService.reiniciar();
    this.router.navigate(['/dispensacion']);
  }

  siguiente(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.dispensacionService.setPaciente(p);
    this.router.navigate(['/dispensacion/medicamentos']);
  }

  limpiarError(): void {
    this.errorMsg.set('');
  }

  private presentToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
  }

  getSituacionViviendaLabel(value: string | undefined | null): string {
    const labels: Record<string, string> = {
      'no_afectado': 'No afectado',
      'vivienda_afectada': 'Vivienda afectada',
      'damnificado': 'Damnificado',
    };
    return labels[value ?? ''] ?? value ?? 'No afectado';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string'
        ? error.error.message
        : Array.isArray(error.error?.message)
          ? error.error.message.join(' · ')
          : null;
      return backendMessage ?? fallback;
    }
    return fallback;
  }
}
