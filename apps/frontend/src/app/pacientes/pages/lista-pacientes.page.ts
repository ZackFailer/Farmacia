import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
  IonFab, IonFabButton, IonMenuButton, IonList, IonSpinner,
   IonToast, ModalController, ViewWillEnter,
} from '@ionic/angular/standalone';
import { PacientesService } from '../services/pacientes.service';
import type { Paciente } from '../../shared/models/paciente.model';
import { RegistroPacienteModal } from '../modals/registro-paciente.modal';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import { normalizePacienteQrId } from '../../shared/utils/paciente-qr.util';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
    IonFab, IonFabButton, IonMenuButton, IonList, IonSpinner, IonToast,
    EscanerQrComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Pacientes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Busque paciente por QR, cédula, nombre o ID de emergencia.</p>

      <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

      <ion-searchbar
        [(ngModel)]="searchTerm"
        (ionInput)="buscar()"
        placeholder="Ej: EM-2026-001, 12345678 o nombre"
        debounce="300"
      ></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Buscando...</p>
        </div>
      }

      @if (!cargando() && pacientes().length === 0 && searchTerm.trim()) {
        <div class="app-empty">
          <ion-icon name="search-outline" class="app-empty-icon"></ion-icon>
          <h3>Sin resultados</h3>
          <p>No se encontraron pacientes con "{{ searchTerm }}"</p>
        </div>
      }

      @if (!cargando() && pacientes().length === 0 && !searchTerm.trim()) {
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

    <ion-toast
      [isOpen]="showToast()"
      [message]="toastMessage()"
      [duration]="3000"
      [color]="toastColor()"
      (didDismiss)="showToast.set(false)"
    ></ion-toast>
  `,
})
export class ListaPacientesPage implements ViewWillEnter {
  searchTerm = '';
  cargando = signal(false);
  pacientes = signal<Paciente[]>([]);
  errorScan = signal('');
  showToast = signal(false);
  toastMessage = signal('');
  toastColor = signal<'success' | 'danger'>('success');

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

  onCodigoEscaneado(code: string): void {
    const scannedValue = code.trim();
    const idEmergencia = normalizePacienteQrId(scannedValue).toUpperCase();
    if (!idEmergencia) {
      this.errorScan.set('No se detecto un codigo QR valido');
      return;
    }

    this.searchTerm = idEmergencia;
    this.cargando.set(true);
    this.pacientesService.getPacienteByIdEmergencia(idEmergencia).subscribe({
      next: (p) => {
        this.pacientes.set([p]);
        this.cargando.set(false);
      },
      error: () => {
        this.pacientesService.buscarPaciente(scannedValue).subscribe({
          next: (items) => {
            this.pacientes.set(items);
            this.cargando.set(false);
            this.errorScan.set(items.length ? '' : 'Paciente no encontrado para el codigo escaneado');
          },
          error: () => {
            this.pacientes.set([]);
            this.cargando.set(false);
            this.errorScan.set('Paciente no encontrado para el codigo escaneado');
          },
        });
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
          this.presentToast('Paciente registrado correctamente.', 'success');
          this.router.navigate(['/pacientes', p.id]);
        },
        error: (error: unknown) => {
          this.cargando.set(false);
          this.presentToast(this.getErrorMessage(error, 'No se pudo registrar el paciente.'), 'danger');
        },
      });
    }
  }

  private presentToast(message: string, color: 'success' | 'danger'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showToast.set(true);
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
