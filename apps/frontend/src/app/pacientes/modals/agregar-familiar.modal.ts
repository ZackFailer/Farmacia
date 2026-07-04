import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
  IonFooter, ModalController,
} from '@ionic/angular/standalone';
import { PacientesService } from '../services/pacientes.service';
import type { Paciente } from '../../shared/models/paciente.model';

@Component({
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
    IonContent, IonItem, IonInput, IonLabel, IonSelect, IonSelectOption,
    IonFooter, FormsModule,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Agregar Familiar</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">✕</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Buscar paciente por ID, nombre o cédula</ion-label>
        <ion-input [(ngModel)]="searchTerm" placeholder="EM-2026-001" (ionInput)="buscar()"></ion-input>
      </ion-item>

      @if (resultados(); as pacientes) {
        @for (p of pacientes; track p.id) {
          <ion-item button (click)="seleccionarPaciente(p)" [class.selected]="selectedId() === p.id">
            <ion-label>
              <h2>{{ p.nombre }} {{ p.apellido }}</h2>
              <p>{{ p.id_emergencia }}</p>
            </ion-label>
          </ion-item>
        }
      }

      @if (selectedId()) {
        <ion-item>
          <ion-label position="stacked">Parentesco *</ion-label>
          <ion-select [(ngModel)]="relacion" interface="action-sheet">
            <ion-select-option value="Hijo/a">Hijo/a</ion-select-option>
            <ion-select-option value="Cónyuge">Cónyuge</ion-select-option>
            <ion-select-option value="Padre/Madre">Padre/Madre</ion-select-option>
            <ion-select-option value="Hermano/a">Hermano/a</ion-select-option>
            <ion-select-option value="Abuelo/a">Abuelo/a</ion-select-option>
            <ion-select-option value="Otro">Otro</ion-select-option>
          </ion-select>
        </ion-item>
      }
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button fill="clear" color="medium" (click)="dismiss()">Cancelar</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button fill="solid" color="primary" (click)="guardar()" [disabled]="!selectedId() || !relacion">Agregar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
  styles: [`
    .selected {
      --background: var(--app-primary-light);
      --color: white;
    }
  `],
})
export class AgregarFamiliarModal {
  searchTerm = '';
  relacion = '';
  resultados = signal<Paciente[] | null>(null);
  selectedId = signal<number | null>(null);

  constructor(
    private modalCtrl: ModalController,
    private pacientesService: PacientesService,
  ) {}

  buscar(): void {
    const term = this.searchTerm.trim();
    if (!term) {
      this.resultados.set(null);
      return;
    }
    this.pacientesService.buscarPaciente(term).subscribe({
      next: (items) => this.resultados.set(items),
      error: () => this.resultados.set(null),
    });
  }

  seleccionarPaciente(p: Paciente): void {
    this.selectedId.set(p.id);
  }

  guardar(): void {
    if (!this.selectedId() || !this.relacion) return;
    this.modalCtrl.dismiss({ pacienteId: this.selectedId(), relacion: this.relacion }, 'confirm');
  }

  dismiss(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
