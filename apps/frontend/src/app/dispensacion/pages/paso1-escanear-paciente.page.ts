import { Component, signal } from '@angular/core';
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
  ModalController,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { EncabezadoPasoComponent } from '../components/encabezado-paso.component';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import { DispensacionService } from '../services/dispensacion.service';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { BusquedaPacienteModal } from '../../pacientes/modals/busqueda-paciente.modal';
import { RegistroPacienteModal } from '../../pacientes/modals/registro-paciente.modal';
import { PacienteQrModal } from '../../pacientes/modals/paciente-qr.modal';
import type { Paciente } from '../../shared/models/paciente.model';
import type { Receta } from '../../shared/models/receta.model';
import { normalizePacienteQrId } from '../../shared/utils/paciente-qr.util';

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
    EncabezadoPasoComponent,
    EscanerQrComponent,
  ],
  template: `
    <app-encabezado-paso [paso]="1"></app-encabezado-paso>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Paso 1 de 3: seleccionar paciente por QR, cédula/ID o receta pendiente.</p>

      <h3>Identificación manual</h3>
      @if (!pacienteIdentificado()) {
        <div style="text-align: center; padding: var(--app-space-2xl) 0;">
          <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>
          <p style="margin: var(--app-space-lg) 0 var(--app-space-xl);">Escanee el código del paciente (brazalete / receta)</p>

          <ion-searchbar [(ngModel)]="codigoBuscado" (ionInput)="buscarPorCodigo()" placeholder="Buscar por ID emergencia o cédula..." debounce="500"></ion-searchbar>

          <div style="display: flex; flex-direction: column; gap: var(--app-space-md); margin-top: var(--app-space-xl);">
            <ion-button expand="block" fill="outline" (click)="abrirBusquedaManual()">
              Buscar paciente manual
            </ion-button>
            <ion-button expand="block" fill="outline" (click)="abrirRegistroPaciente()">
              Registrar nuevo paciente
            </ion-button>
          </div>
        </div>
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
            <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }} @if (p.es_titular) { · Titular de núcleo familiar } @else if (p.tiene_carga_familiar) { · Carga familiar }</ion-note>
          </ion-label>
        </ion-item>

        @if (p.familiares?.length) {
          <div class="familiares-card">
            <p class="familiares-title">Núcleo familiar ({{ p.familiares!.length }})</p>
            @for (f of p.familiares; track f.id) {
              <div class="familiar-row">
                <span class="familiar-nombre">{{ f.nombre }} {{ f.apellido }}</span>
                <span class="familiar-detalle">{{ f.relacion }} · {{ f.edad_estimada }} años · {{ f.peso_estimado }} kg · {{ f.sexo === 'M' ? 'M' : 'F' }} @if (f.es_damnificado) { · Damnificado }</span>
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
                <ion-note>{{ receta.detalles.length }} medicamento(s) · Dr. {{ receta.doctor?.nombre ?? 'N/A' }}</ion-note>
              </ion-label>
              <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
})
export class Paso1EscanearPacientePage implements ViewWillEnter {
  codigoBuscado = '';
  pacienteIdentificado = signal<Paciente | null>(null);
  errorMsg = signal('');
  recetasPendientes = signal<Receta[]>([]);
  cargandoRecetas = signal(false);

  constructor(
    private dispensacionService: DispensacionService,
    private pacientesService: PacientesService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ionViewWillEnter(): void {
    this.pacienteIdentificado.set(null);
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
          return;
        }
        this.pacienteIdentificado.set(p[0]);
        this.errorMsg.set('');
      },
      error: () => {
        this.errorMsg.set('Paciente no encontrado con ese criterio');
      },
    });
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
    this.router.navigate(['/dispensacion/paso2']);
  }

  async abrirBusquedaManual(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: BusquedaPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();

    if (role === 'seleccionar' && data?.paciente) {
      this.pacienteIdentificado.set(data.paciente);
      this.errorMsg.set('');
    } else if (role === 'registrar') {
      this.abrirRegistroPaciente();
    }
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
          this.mostrarQrPaciente(p);
        },
        error: (err) => this.errorMsg.set(err.message),
      });
    }
  }

  private async mostrarQrPaciente(p: Paciente): Promise<void> {
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

  verHistorial(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.router.navigate(['/historial', p.id_emergencia]);
  }

  cancelar(): void {
    this.dispensacionService.reiniciar();
    this.router.navigate(['/dispensacion/paso1']);
  }

  siguiente(): void {
    const p = this.pacienteIdentificado();
    if (!p) return;
    this.dispensacionService.setPaciente(p);
    this.router.navigate(['/dispensacion/paso2']);
  }

  limpiarError(): void {
    this.errorMsg.set('');
  }

  static styles = [`
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
  `];
}
