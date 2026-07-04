import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
  IonFab, IonFabButton, IonBackButton, IonList, IonSpinner,
  ModalController, ViewWillEnter,
} from '@ionic/angular/standalone';
import { PacientesService } from '../services/pacientes.service';
import type { Paciente } from '../../shared/models/paciente.model';
import { RegistroPacienteModal } from '../modals/registro-paciente.modal';
import { BusquedaPacienteModal } from '../modals/busqueda-paciente.modal';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonContent, IonItem, IonLabel, IonNote, IonSearchbar, IonIcon,
    IonFab, IonFabButton, IonBackButton, IonList, IonSpinner,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Pacientes</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-searchbar
        [(ngModel)]="searchTerm"
        (ionInput)="buscar()"
        placeholder="Buscar por ID, nombre o cédula..."
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
          <p>Use el buscador para encontrar pacientes por ID, nombre o cédula</p>
        </div>
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

  constructor(
    private pacientesService: PacientesService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ionViewWillEnter(): void {
    this.searchTerm = '';
    this.pacientes.set([]);
  }

  buscar(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.pacientes.set([]);
      return;
    }
    this.cargando.set(true);
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (p) => {
        this.pacientes.set([p]);
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
        },
        error: () => this.cargando.set(false),
      });
    }
  }
}
