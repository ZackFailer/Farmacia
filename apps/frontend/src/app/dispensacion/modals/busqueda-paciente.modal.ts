import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonNote,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { DispensacionService } from '../services/dispensacion.service';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonNote,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Buscar Paciente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">ID, nombre o cédula del paciente</ion-label>
        <ion-input [(ngModel)]="searchTerm" placeholder="EM-2026-001, Juan Perez o V-12345678"></ion-input>
      </ion-item>

      <ion-button expand="block" (click)="buscar()" [disabled]="!searchTerm.trim()">
        Buscar
      </ion-button>

      @if (error()) {
        <p class="app-inline-error ion-padding-start">{{ error() }}</p>
      }

      @if (resultados(); as pacientes) {
        @for (p of pacientes; track p.id) {
          <ion-item button (click)="seleccionar(p)" class="paciente-item">
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }} @if (p.cedula) { · {{ p.cedula }} }</p>
              <p>{{ p.sexo === 'M' ? 'Masculino' : 'Femenino' }} | {{ p.edad_estimada }} años</p>
              <ion-note>{{ p.es_damnificado ? 'Damnificado' : 'No damnificado' }}</ion-note>
              @if (p.familiares?.length) {
                <div class="familiares-info">
                  <p class="familiares-label">Núcleo familiar ({{ p.familiares!.length }}):</p>
                  @for (f of p.familiares; track f.id) {
                    <p class="familiar-item">{{ f.nombre }} {{ f.apellido }} · {{ f.relacion }} · {{ f.edad_estimada }} años · {{ f.peso_estimado }} kg · {{ f.es_damnificado ? 'Damnificado' : 'No damnif.' }}</p>
                  }
                </div>
              }
            </ion-label>
          </ion-item>
        }
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
          <ion-button fill="clear" color="primary" (click)="registrarNuevo()">Registrar nuevo</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .paciente-item {
      margin-top: var(--app-space-md);
    }
    .familiares-info {
      margin-top: var(--app-space-sm);
      padding: var(--app-space-sm);
      background: var(--app-bg);
      border-radius: var(--app-radius-sm);
    }
    .familiares-label {
      font-size: var(--app-font-size-xs);
      font-weight: 600;
      color: var(--app-text-secondary);
      margin: 0 0 var(--app-space-xs);
    }
    .familiar-item {
      font-size: var(--app-font-size-xs);
      color: var(--app-text-secondary);
      margin: 2px 0;
    }
  `],
})
export class BusquedaPacienteModal {
  searchTerm = '';
  error = signal('');
  resultados = signal<Paciente[] | null>(null);

  constructor(
    private modalCtrl: ModalController,
    private dispensacionService: DispensacionService,
  ) {}

  buscar(): void {
    const term = this.searchTerm.trim();
    if (!term) return;
    this.error.set('');
    this.resultados.set(null);

    this.dispensacionService.buscarPaciente(term).subscribe({
      next: (p) => this.resultados.set([p]),
      error: () => this.error.set('Paciente no encontrado'),
    });
  }

  seleccionar(p: Paciente): void {
    this.modalCtrl.dismiss({ paciente: p }, 'seleccionar');
  }

  registrarNuevo(): void {
    this.modalCtrl.dismiss(null, 'registrar');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
