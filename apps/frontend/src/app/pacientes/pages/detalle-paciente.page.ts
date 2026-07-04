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

        <ion-button expand="block" fill="outline" (click)="verQrPaciente()">
          Ver QR del paciente
        </ion-button>

        @if (puedeVerHistorial()) {
          <ion-button expand="block" fill="outline" (click)="verHistorial()">
            Ver historial de dispensaciones
          </ion-button>
        }

        @if (puedeCrearReceta()) {
          <ion-button expand="block" (click)="crearReceta()">
            Crear receta
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
})
export class DetallePacientePage {
  cargando = signal(true);
  paciente = signal<Paciente | null>(null);
  familiares = signal<Familiar[]>([]);
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

  puedeCrearReceta(): boolean {
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
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  verHistorial(): void {
    const p = this.paciente();
    if (!p) return;
    this.router.navigate(['/historial', p.id_emergencia]);
  }

  crearReceta(): void {
    const p = this.paciente();
    if (!p) return;
    this.router.navigate(['/recetas'], {
      queryParams: { pacienteId: p.id, idEmergencia: p.id_emergencia },
    });
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

  async verQrPaciente(): Promise<void> {
    const p = this.paciente();
    if (!p) return;

    const modal = await this.modalCtrl.create({
      component: PacienteQrModal,
      componentProps: {
        idEmergencia: p.id_emergencia,
        nombre: `${p.nombre} ${p.apellido}`,
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
