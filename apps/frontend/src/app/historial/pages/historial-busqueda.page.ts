import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonSearchbar,
  IonNote,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/angular/standalone';
import { PacientesService } from '../../pacientes/services/pacientes.service';
import { EscanerQrComponent } from '../../shared/components/escaner-qr.component';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSearchbar,
    IonNote,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    EscanerQrComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Historial</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p class="page-subtitle">Busque paciente por QR, cédula, nombre o ID de emergencia para abrir historial.</p>

      <app-escaner-qr (codigoEscaneado)="onCodigoEscaneado($event)"></app-escaner-qr>

      <ion-searchbar
        [(ngModel)]="searchTerm"
        (ionInput)="buscarPacientes()"
        placeholder="Ej: EM-2026-001, 12345678 o nombre"
        debounce="300"
      ></ion-searchbar>

      @if (cargando()) {
        <div class="app-loading app-loading-compact">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Buscando pacientes...</p>
        </div>
      }

      @if (resultados().length > 0) {
        <ion-list>
          @for (p of resultados(); track p.id) {
            <ion-item button (click)="abrirHistorial(p)">
              <ion-label>
                <h2>{{ p.nombre }} {{ p.apellido }}</h2>
                <p>ID: {{ p.id_emergencia }} @if (p.cedula) { · C.I.: {{ p.cedula }} }</p>
                <ion-note>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} · {{ p.edad_estimada }} años</ion-note>
              </ion-label>
            </ion-item>
          }
        </ion-list>
      }

      @if (errorMsg()) {
        <ion-note color="danger">{{ errorMsg() }}</ion-note>
      }
    </ion-content>
  `,
})
export class HistorialBusquedaPage {
  searchTerm = '';
  cargando = signal(false);
  resultados = signal<Paciente[]>([]);
  errorMsg = signal('');

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
  ) {}

  onCodigoEscaneado(codigo: string): void {
    const id = codigo.trim().toUpperCase();
    if (!id) {
      this.errorMsg.set('Código QR inválido.');
      return;
    }

    this.cargando.set(true);
    this.pacientesService.getPacienteByIdEmergencia(id).subscribe({
      next: (paciente) => {
        this.cargando.set(false);
        this.errorMsg.set('');
        this.abrirHistorial(paciente);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMsg.set('No se encontró paciente para el QR escaneado.');
      },
    });
  }

  buscarPacientes(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.resultados.set([]);
      this.errorMsg.set('');
      return;
    }

    this.cargando.set(true);
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (items) => {
        this.cargando.set(false);
        this.resultados.set(items);
        if (items.length === 0) {
          this.errorMsg.set('No se encontraron pacientes con ese criterio.');
          return;
        }
        this.errorMsg.set('');
      },
      error: () => {
        this.cargando.set(false);
        this.resultados.set([]);
        this.errorMsg.set('Error al buscar pacientes.');
      },
    });
  }

  abrirHistorial(paciente: Paciente): void {
    const idEmergencia = paciente.id_emergencia.trim().toUpperCase();
    if (!idEmergencia) {
      this.errorMsg.set('Paciente sin ID de emergencia válido.');
      return;
    }

    this.errorMsg.set('');
    this.router.navigate(['/historial', idEmergencia]);
  }
}
