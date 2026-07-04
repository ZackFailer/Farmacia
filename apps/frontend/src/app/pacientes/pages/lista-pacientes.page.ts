import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
  IonFab, IonFabButton, IonMenuButton, IonList, IonSpinner,
  ModalController, ViewWillEnter,
} from '@ionic/angular/standalone';
import { PacientesService } from '../services/pacientes.service';
import type { Paciente } from '../../shared/models/paciente.model';
import { RegistroPacienteModal } from '../modals/registro-paciente.modal';
import { PacienteQrModal } from '../modals/paciente-qr.modal';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
    IonFab, IonFabButton, IonMenuButton, IonList, IonSpinner,
    EscanerQrComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Pacientes</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="toggleModo()">
            <ion-icon [name]="modoEscaner() ? 'search-outline' : 'scan-outline'" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (modoEscaner()) {
        <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>
      }

      @if (!modoEscaner()) {
        <ion-searchbar
          [(ngModel)]="searchTerm"
          (ionInput)="buscar()"
          placeholder="Buscar por ID, nombre o cédula..."
          debounce="300"
        ></ion-searchbar>
      }

      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Buscando...</p>
        </div>
      }

      @if (!cargando() && pacientes().length === 0 && !modoEscaner() && searchTerm.trim()) {
        <div class="app-empty">
          <ion-icon name="search-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>No se encontraron pacientes con "{{ searchTerm }}"</p>
        </div>
      }

      @if (!cargando() && pacientes().length === 0 && !modoEscaner() && !searchTerm.trim()) {
        <div class="app-empty">
          <ion-icon name="people-outline" class="app-empty-icon"></ion-icon>
          <h3>Buscar pacientes</h3>
          <p>Use el buscador o el escáner QR para encontrar pacientes</p>
        </div>
      }

      @if (errorScan()) {
        <p class="app-inline-error">{{ errorScan() }}</p>
      }

      <ion-list>
        @for (p of pacientes(); track p.id) {
          <ion-item button (click)="verDetalle(p)">
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }} @if (p.cedula) { · {{ p.cedula }} }</p>
              <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años | {{ p.peso_estimado }} kg</ion-note>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    </ion-content>

    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button color="primary" (click)="registrarPaciente()">
        <ion-icon name="add-outline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
  `,
})
export class ListaPacientesPage implements ViewWillEnter {
  searchTerm = '';
  cargando = signal(false);
  pacientes = signal<Paciente[]>([]);
  modoEscaner = signal(false);
  errorScan = signal('');

  constructor(
    private pacientesService: PacientesService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ionViewWillEnter(): void {
    this.searchTerm = '';
    this.pacientes.set([]);
    this.errorScan.set('');
  }

  toggleModo(): void {
    this.modoEscaner.update((v) => !v);
    this.errorScan.set('');
  }

  onCodigoEscaneado(code: string): void {
    this.modoEscaner.set(false);
    this.searchTerm = code;
    this.cargando.set(true);
    this.pacientesService.getPacienteByIdEmergencia(code).subscribe({
      next: (p) => {
        this.pacientes.set([p]);
        this.cargando.set(false);
      },
      error: () => {
        this.pacientes.set([]);
        this.cargando.set(false);
        this.errorScan.set('Paciente no encontrado para el código escaneado');
      },
    });
  }

  buscar(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.pacientes.set([]);
      return;
    }
    this.cargando.set(true);
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (items) => {
        this.pacientes.set(items);
        this.cargando.set(false);
      },
      error: () => {
        this.pacientes.set([]);
        this.cargando.set(false);
      },
    });
  }

  verDetalle(p: Paciente): void {
    this.router.navigate(['/pacientes', p.id]);
  }

  async registrarPaciente(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: RegistroPacienteModal,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.cargando.set(true);
      this.pacientesService.registrarPaciente(data).subscribe({
        next: (p) => {
          this.pacientes.set([p]);
          this.cargando.set(false);
          this.mostrarQrPaciente(p);
        },
        error: () => this.cargando.set(false),
      });
    }
  }

  private async mostrarQrPaciente(paciente: Paciente): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PacienteQrModal,
      componentProps: {
        idEmergencia: paciente.id_emergencia,
        nombre: `${paciente.nombre} ${paciente.apellido}`,
      },
    });
    await modal.present();
  }
}
